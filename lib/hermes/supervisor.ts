// ─── Hermes Supervisor (Phase 5) ────────────────────────────────────────────
// Periodic oversight: runs the admin health/audit/error agents, reads circuit
// breaker state, and returns a single consolidated status. Schedule it (every
// few minutes) or call it from the dashboard. Read-only — never mutates.

import { runAgent } from './runner'
import { getBreakerStates } from './runner'
import { registerMeshAgents } from './agents'

export interface SupervisorStatus {
  at: string
  healthy: boolean
  adapters: Array<{ name: string; status: string }>
  audit: { totalRuns: number; successRate: number; errors: number; avgLatencyMs: number }
  errors24h: { errorCount: number; circuitOpens: number; byAgent: Record<string, number> }
  breakers: Array<{ agent: string; failures: number; open: boolean }>
  alerts: string[]
}

export async function supervise(): Promise<SupervisorStatus> {
  registerMeshAgents()
  const health = await runAgent<{ ok: boolean; adapters: Array<{ name: string; status: string }> }>('admin.system-health', {})
  const audit = await runAgent<{ totalRuns: number; successRate: number; errors: number; avgLatencyMs: number }>('admin.automation-audit', {})
  const err = await runAgent<{ errorCount: number; circuitOpens: number; byAgent: Record<string, number> }>('admin.error-review', { sinceHours: 24 })
  const breakers = getBreakerStates().map((b) => ({ agent: b.agent, failures: b.failures, open: b.open }))

  const alerts: string[] = []
  if (!health.output?.ok) alerts.push('one or more critical adapters are down')
  if ((audit.output?.successRate ?? 100) < 90) alerts.push(`success rate ${audit.output?.successRate}% below 90%`)
  if ((err.output?.circuitOpens ?? 0) > 0) alerts.push(`${err.output?.circuitOpens} circuit breaker(s) tripped in 24h`)
  for (const b of breakers) if (b.open) alerts.push(`circuit OPEN: ${b.agent}`)

  return {
    at: new Date().toISOString(),
    healthy: alerts.length === 0,
    adapters: health.output?.adapters ?? [],
    audit: { totalRuns: audit.output?.totalRuns ?? 0, successRate: audit.output?.successRate ?? 0, errors: audit.output?.errors ?? 0, avgLatencyMs: audit.output?.avgLatencyMs ?? 0 },
    errors24h: { errorCount: err.output?.errorCount ?? 0, circuitOpens: err.output?.circuitOpens ?? 0, byAgent: err.output?.byAgent ?? {} },
    breakers,
    alerts,
  }
}
