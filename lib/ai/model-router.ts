// ─── Model Router ─────────────────────────────────────────────────────────────
// Single source of truth for model selection. Reads automation-os/config/model-routing.json
// and exposes typed accessors. NOTHING ELSE in the codebase should hardcode a model name.
// ─────────────────────────────────────────────────────────────────────────────
import * as fs from 'fs'
import * as path from 'path'

export type TaskType =
  | 'content_generation'
  | 'content_variants'
  | 'lead_scoring'
  | 'outreach_drafts'
  | 'seo_synthesis'
  | 'daily_report'
  | 'routing_decisions'
  | 'qa_review'
  | 'self_audit'
  | 'campaign_strategy'
  | 'compliance_review'
  | 'agent_planner'
  | 'video_script'
  | 'dedup_categorization'

export interface ModelConfig {
  provider: 'anthropic' | 'openai'
  model: string
  reason: string
  maxTokens: number
  temperature: number
}

interface RawRoutingRule {
  provider: 'anthropic' | 'openai'
  model: string
  reason: string
  max_tokens: number
  temperature: number
}

interface RoutingConfigFile {
  routing_rules: Record<string, RawRoutingRule>
  cost_guardrails: {
    max_daily_anthropic_calls: number
    max_daily_openai_calls: number
    max_daily_total_cost_usd: number
    alert_threshold_cost_usd: number
    telegram_alert_on_threshold: boolean
  }
  fallback_strategy: Record<string, string>
}

let _config: RoutingConfigFile | null = null

function loadConfig(): RoutingConfigFile {
  if (_config) return _config

  const configPath = path.resolve(
    process.cwd(),
    'automation-os/config/model-routing.json'
  )

  if (!fs.existsSync(configPath)) {
    throw new Error(`model-routing.json not found at ${configPath}`)
  }

  try {
    const raw = fs.readFileSync(configPath, 'utf8')
    _config = JSON.parse(raw) as RoutingConfigFile
    return _config
  } catch (err) {
    throw new Error(
      `Failed to parse model-routing.json: ${err instanceof Error ? err.message : String(err)}`
    )
  }
}

/**
 * Get the model configuration for a given task type.
 * Throws if the task type is not configured (forces explicit routing decisions).
 */
export function getModelConfig(taskType: TaskType): ModelConfig {
  const config = loadConfig()
  const rule = config.routing_rules[taskType]

  if (!rule) {
    throw new Error(
      `No routing rule for task type "${taskType}". ` +
      `Add it to automation-os/config/model-routing.json or use an existing TaskType.`
    )
  }

  return {
    provider: rule.provider,
    model: rule.model,
    reason: rule.reason,
    maxTokens: rule.max_tokens,
    temperature: rule.temperature,
  }
}

/**
 * Get the OpenAI fallback model for a Claude model.
 * Used only after Claude API has failed all retries.
 */
export function getFallbackModel(claudeModel: string): string | null {
  const config = loadConfig()
  return config.fallback_strategy[claudeModel] ?? null
}

/**
 * Get cost guardrail thresholds for daily cost limiting.
 */
export function getCostGuardrails() {
  return loadConfig().cost_guardrails
}

/**
 * Reset the cached config. Useful for tests or hot-reload scenarios.
 */
export function resetModelRouterCache(): void {
  _config = null
}

/**
 * Get all task types that route to Anthropic — used for telemetry/reporting.
 */
export function getAnthropicTaskTypes(): TaskType[] {
  const config = loadConfig()
  return (Object.entries(config.routing_rules) as [TaskType, RawRoutingRule][])
    .filter(([_, rule]) => rule.provider === 'anthropic')
    .map(([type]) => type)
}
