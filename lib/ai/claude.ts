// ─── Claude (Anthropic) Wrapper ───────────────────────────────────────────────
// Single entry point for ALL Claude calls across the agent stack.
// Reads model selection from automation-os/config/model-routing.json so model
// choice is config-driven, not hardcoded.
//
// Usage:
//   import { callClaude, callClaudeJSON } from '@/lib/ai/claude'
//   const text = await callClaude({ taskType: 'content_generation', system, user })
//   const json = await callClaudeJSON<MyShape>({ taskType: 'lead_scoring', system, user })
// ─────────────────────────────────────────────────────────────────────────────
import Anthropic from '@anthropic-ai/sdk'
import { getModelConfig, type TaskType } from './model-router'
import { logAIUsage } from './usage-log'

let _client: Anthropic | null = null
function getClient(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not set. Required for Claude calls.')
    }
    _client = new Anthropic({ apiKey })
  }
  return _client
}

export interface CallClaudeOptions {
  taskType: TaskType
  system?: string
  user: string
  // Optional overrides — only use if model-routing.json doesn't fit the task
  modelOverride?: string
  maxTokensOverride?: number
  temperatureOverride?: number
  // Telemetry
  lane?: string
  agentName?: string
  // Retry behavior
  maxRetries?: number
}

export interface CallClaudeResult {
  text: string
  model: string
  inputTokens: number
  outputTokens: number
  costUsd: number
  latencyMs: number
}

/**
 * Standard Claude call returning text. Logs cost + usage automatically.
 */
export async function callClaude(opts: CallClaudeOptions): Promise<CallClaudeResult> {
  const cfg = getModelConfig(opts.taskType)
  const model = opts.modelOverride ?? cfg.model
  const maxTokens = opts.maxTokensOverride ?? cfg.maxTokens
  const temperature = opts.temperatureOverride ?? cfg.temperature

  // Verify this is actually an Anthropic model — guard against config drift
  if (!isAnthropicModel(model)) {
    throw new Error(
      `callClaude received non-Anthropic model "${model}" for task "${opts.taskType}". ` +
      `Check automation-os/config/model-routing.json — only Claude models should route here.`
    )
  }

  const client = getClient()
  const startedAt = Date.now()
  const maxRetries = opts.maxRetries ?? 3

  // Newer Opus models (4.6+) reject the temperature parameter — omit it for those.
  const acceptsTemperature = !isNewOpusModel(model)

  let lastError: unknown = null
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await client.messages.create({
        model,
        max_tokens: maxTokens,
        ...(acceptsTemperature ? { temperature } : {}),
        system: opts.system,
        messages: [{ role: 'user', content: opts.user }],
      })

      const text = response.content
        .filter(block => block.type === 'text')
        .map(block => (block.type === 'text' ? block.text : ''))
        .join('')

      const latencyMs = Date.now() - startedAt
      const inputTokens = response.usage.input_tokens
      const outputTokens = response.usage.output_tokens
      const costUsd = calculateCost(model, inputTokens, outputTokens)

      // Fire-and-forget cost log (don't block return)
      void logAIUsage({
        provider: 'anthropic',
        model,
        task_type: opts.taskType,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        cost_usd: costUsd,
        latency_ms: latencyMs,
        lane: opts.lane,
        agent_name: opts.agentName,
      }).catch(() => { /* logging must never break the agent */ })

      return { text, model, inputTokens, outputTokens, costUsd, latencyMs }
    } catch (err) {
      lastError = err
      const isLastAttempt = attempt === maxRetries
      if (isLastAttempt) break
      // Exponential backoff: 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000))
    }
  }

  throw new Error(
    `Claude call failed for task "${opts.taskType}" after ${maxRetries} attempts. ` +
    `Last error: ${lastError instanceof Error ? lastError.message : String(lastError)}`
  )
}

/**
 * Claude call expecting structured JSON output. Parses + validates response.
 * Includes JSON-mode instruction in the system prompt.
 */
export async function callClaudeJSON<T = unknown>(opts: CallClaudeOptions): Promise<{
  json: T
  meta: Omit<CallClaudeResult, 'text'>
}> {
  const enhancedSystem = [
    opts.system ?? '',
    '',
    'CRITICAL: Respond with ONLY a valid JSON object. No prose, no markdown code fences, no commentary.',
    'Start your response with { and end with }. Nothing else.',
  ].filter(Boolean).join('\n')

  const result = await callClaude({ ...opts, system: enhancedSystem })

  // Strip any accidental markdown fences
  const cleaned = result.text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  let parsed: T
  try {
    parsed = JSON.parse(cleaned) as T
  } catch (err) {
    throw new Error(
      `Claude JSON parse failed for task "${opts.taskType}". ` +
      `Raw response start: "${cleaned.slice(0, 200)}". ` +
      `Error: ${err instanceof Error ? err.message : String(err)}`
    )
  }

  return {
    json: parsed,
    meta: {
      model: result.model,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      costUsd: result.costUsd,
      latencyMs: result.latencyMs,
    },
  }
}

/**
 * Verify a model string belongs to Anthropic. Used as a guard before sending.
 */
export function isAnthropicModel(model: string): boolean {
  return model.startsWith('claude-')
}

/**
 * Newer Opus models (4.6+) deprecated the temperature parameter — passing it
 * causes a 400 invalid_request_error. This helper detects those models.
 */
function isNewOpusModel(model: string): boolean {
  return /^claude-opus-4-([6-9]|\d{2,})/.test(model)
}

/**
 * Calculate cost in USD given Anthropic pricing per 1M tokens.
 * Source: Anthropic public pricing (as of 2026).
 */
function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const PRICING_PER_M: Record<string, { input: number; output: number }> = {
    // Opus family — highest reasoning
    'claude-opus-4-7':  { input: 15.00, output: 75.00 },
    'claude-opus-4-6':  { input: 15.00, output: 75.00 },
    'claude-opus-4-5-20251101':  { input: 15.00, output: 75.00 },
    'claude-opus-4-5':  { input: 15.00, output: 75.00 },
    'claude-opus-4-1-20250805':  { input: 15.00, output: 75.00 },
    'claude-opus-4-20250514':  { input: 15.00, output: 75.00 },
    // Sonnet family — balanced
    'claude-sonnet-4-6':  { input: 3.00,  output: 15.00 },
    'claude-sonnet-4-5-20250929':  { input: 3.00,  output: 15.00 },
    'claude-sonnet-4-20250514':  { input: 3.00, output: 15.00 },
    // Haiku family — fast/cheap
    'claude-haiku-4-5-20251001':  { input: 0.80,  output: 4.00 },
  }

  const price = PRICING_PER_M[model]
  if (!price) {
    // Unknown model — fall back to Opus pricing to over-estimate (safe default)
    return ((inputTokens / 1_000_000) * 15.00) + ((outputTokens / 1_000_000) * 75.00)
  }
  return ((inputTokens / 1_000_000) * price.input) + ((outputTokens / 1_000_000) * price.output)
}

/**
 * Health check — make a tiny Claude call to verify API key and connectivity.
 * Returns true if Claude responds, false on any error.
 */
export async function checkClaudeHealth(): Promise<{ ok: boolean; model?: string; error?: string }> {
  try {
    const result = await callClaude({
      taskType: 'routing_decisions',
      user: 'Respond with exactly: OK',
      maxRetries: 1,
    })
    return { ok: result.text.trim().toUpperCase().includes('OK'), model: result.model }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}
