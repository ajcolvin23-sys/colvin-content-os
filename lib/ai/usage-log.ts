// ─── AI Usage Log ─────────────────────────────────────────────────────────────
// Logs every Claude/OpenAI call to Supabase ai_usage_logs table for cost guardrails
// and per-task observability. Writes are fire-and-forget — must NEVER block the agent.
// ─────────────────────────────────────────────────────────────────────────────
import { createAdminClient } from '@/lib/supabase/admin'

export interface AIUsageEntry {
  provider: 'anthropic' | 'openai'
  model: string
  task_type: string
  input_tokens: number
  output_tokens: number
  cost_usd: number
  latency_ms: number
  lane?: string
  agent_name?: string
  success?: boolean
  error_message?: string
}

/**
 * Append a usage entry to Supabase ai_usage_logs.
 * Never throws — logging failures are silently swallowed to protect the agent path.
 */
export async function logAIUsage(entry: AIUsageEntry): Promise<void> {
  try {
    const supabase = createAdminClient()
    await supabase.from('ai_usage_logs').insert({
      provider: entry.provider,
      model: entry.model,
      task_type: entry.task_type,
      input_tokens: entry.input_tokens,
      output_tokens: entry.output_tokens,
      cost_usd: entry.cost_usd,
      latency_ms: entry.latency_ms,
      lane: entry.lane ?? null,
      agent_name: entry.agent_name ?? null,
      success: entry.success ?? true,
      error_message: entry.error_message ?? null,
    })
  } catch {
    // Silent swallow — never let logging break the agent flow
  }
}

/**
 * Get today's total cost across all providers. Used by cost guardrails.
 * Returns 0 on any error (fail open — never block agent on logging issues).
 */
export async function getTodayCostUsd(): Promise<number> {
  try {
    const supabase = createAdminClient()
    const startOfToday = new Date()
    startOfToday.setUTCHours(0, 0, 0, 0)
    const { data } = await supabase
      .from('ai_usage_logs')
      .select('cost_usd')
      .gte('created_at', startOfToday.toISOString())
    if (!data) return 0
    return data.reduce((sum: number, row: { cost_usd: number | null }) => sum + (row.cost_usd ?? 0), 0)
  } catch {
    return 0
  }
}

/**
 * Get today's call counts per provider. Used by max-calls-per-day guardrails.
 */
export async function getTodayCallCounts(): Promise<{ anthropic: number; openai: number }> {
  try {
    const supabase = createAdminClient()
    const startOfToday = new Date()
    startOfToday.setUTCHours(0, 0, 0, 0)
    const { data } = await supabase
      .from('ai_usage_logs')
      .select('provider')
      .gte('created_at', startOfToday.toISOString())
    if (!data) return { anthropic: 0, openai: 0 }
    let anthropic = 0
    let openai = 0
    for (const row of data as { provider: string }[]) {
      if (row.provider === 'anthropic') anthropic++
      else if (row.provider === 'openai') openai++
    }
    return { anthropic, openai }
  } catch {
    return { anthropic: 0, openai: 0 }
  }
}
