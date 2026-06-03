// ─── Admin / ops agents (Phase 4) ───────────────────────────────────────────
// Keep the mesh healthy and trustworthy: health checks, error-pattern review,
// run auditing, and CRM hygiene. Deterministic; designed to run on a schedule.
// CRM hygiene is report-only by default (no destructive default).

import * as fs from 'fs'
import * as path from 'path'
import type { Agent } from '../types'

const LOG_FILE = path.resolve(process.cwd(), 'logs/agent_runs.jsonl')
function readRuns(): Array<Record<string, unknown>> {
  try { return fs.readFileSync(LOG_FILE, 'utf8').trim().split('\n').map((l) => { try { return JSON.parse(l) } catch { return null } }).filter(Boolean) as Array<Record<string, unknown>> }
  catch { return [] }
}

// 1) System health — env/adapter presence + Supabase reachability
export const systemHealthAgent: Agent<Record<string, never>, { ok: boolean; adapters: Array<{ name: string; status: string; detail?: string }> }> = {
  name: 'admin.system-health',
  description: 'Checks required keys/adapters and Supabase reachability.',
  kind: 'deterministic',
  outputSchema: { type: 'object', required: ['ok', 'adapters'], properties: { ok: { type: 'boolean' }, adapters: { type: 'array' } } },
  async run(_input, ctx) {
    const adapters: Array<{ name: string; status: string; detail?: string }> = []
    const env = (k: string, required = false) => adapters.push({ name: k, status: process.env[k] ? 'ok' : (required ? 'MISSING' : 'absent') })
    env('ANTHROPIC_API_KEY', true); env('NEXT_PUBLIC_SUPABASE_URL', true); env('SUPABASE_SERVICE_ROLE_KEY', true)
    env('OPENAI_API_KEY'); env('BRAVE_SEARCH_API_KEY'); env('TELEGRAM_BOT_TOKEN'); env('PIXABAY_API_KEY')
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin')
      const { error } = await createAdminClient().from('leads').select('id').limit(1)
      adapters.push({ name: 'supabase.leads', status: error ? 'error' : 'ok', detail: error?.message })
    } catch (e) { adapters.push({ name: 'supabase', status: 'error', detail: String(e).slice(0, 80) }) }
    const ok = !adapters.some((a) => a.status === 'MISSING' || a.status === 'error')
    ctx.log(`${adapters.filter((a) => a.status === 'ok').length}/${adapters.length} adapters ok`)
    return { ok, adapters }
  },
}

// 2) Error-pattern review — scan agent_runs for failures
export const errorReviewAgent: Agent<{ sinceHours?: number }, { errorCount: number; byAgent: Record<string, number>; circuitOpens: number }> = {
  name: 'admin.error-review',
  description: 'Scans agent_runs for errors/circuit-opens and groups by agent.',
  kind: 'deterministic',
  inputSchema: { type: 'object', properties: { sinceHours: { type: 'number' } } },
  outputSchema: { type: 'object', required: ['errorCount', 'byAgent', 'circuitOpens'], properties: { errorCount: { type: 'number' }, byAgent: { type: 'object' }, circuitOpens: { type: 'number' } } },
  async run(input, ctx) {
    const cutoff = Date.now() - (input?.sinceHours ?? 24) * 3600_000
    const runs = readRuns().filter((r) => new Date(String(r.created_at)).getTime() > cutoff)
    const errors = runs.filter((r) => r.status === 'error')
    const circuitOpens = runs.filter((r) => r.status === 'circuit_open').length
    const byAgent: Record<string, number> = {}
    for (const e of errors) byAgent[String(e.agent)] = (byAgent[String(e.agent)] ?? 0) + 1
    ctx.log(`${errors.length} errors, ${circuitOpens} circuit-opens`)
    return { errorCount: errors.length, byAgent, circuitOpens }
  },
}

// 3) Automation audit — run stats + success rate
export const automationAuditAgent: Agent<Record<string, never>, { totalRuns: number; ok: number; errors: number; successRate: number; topAgents: Array<{ agent: string; count: number }>; avgLatencyMs: number }> = {
  name: 'admin.automation-audit',
  description: 'Aggregates agent_runs into success rate, top agents, and latency.',
  kind: 'deterministic',
  outputSchema: { type: 'object', required: ['totalRuns', 'successRate', 'topAgents'], properties: { totalRuns: { type: 'number' }, ok: { type: 'number' }, errors: { type: 'number' }, successRate: { type: 'number' }, topAgents: { type: 'array' }, avgLatencyMs: { type: 'number' } } },
  async run(_input, ctx) {
    const runs = readRuns()
    const ok = runs.filter((r) => r.status === 'ok').length
    const errors = runs.filter((r) => r.status === 'error').length
    const counts: Record<string, number> = {}
    let latSum = 0, latN = 0
    for (const r of runs) { counts[String(r.agent)] = (counts[String(r.agent)] ?? 0) + 1; if (typeof r.latency_ms === 'number') { latSum += r.latency_ms; latN++ } }
    const topAgents = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([agent, count]) => ({ agent, count }))
    const successRate = runs.length ? Math.round((ok / runs.length) * 100) : 100
    ctx.log(`${runs.length} runs, ${successRate}% ok`)
    return { totalRuns: runs.length, ok, errors, successRate, topAgents, avgLatencyMs: latN ? Math.round(latSum / latN) : 0 }
  },
}

// 4) CRM hygiene — report stale leads (report-only by default; apply archives)
export const crmHygieneAgent: Agent<{ staleDays?: number; apply?: boolean }, { staleCount: number; archived: number }> = {
  name: 'admin.crm-hygiene',
  description: 'Reports leads not contacted in N days (report-only unless apply=true).',
  kind: 'deterministic',
  inputSchema: { type: 'object', properties: { staleDays: { type: 'number' }, apply: { type: 'boolean' } } },
  outputSchema: { type: 'object', required: ['staleCount', 'archived'], properties: { staleCount: { type: 'number' }, archived: { type: 'number' } } },
  async run(input, ctx) {
    const staleDays = input?.staleDays ?? 90
    const cutoff = new Date(Date.now() - staleDays * 86400_000).toISOString()
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin')
      const supabase = createAdminClient()
      const { data } = await supabase.from('leads').select('id').lt('last_contacted_at', cutoff).neq('status', 'archived')
      const staleCount = data?.length ?? 0
      let archived = 0
      if (input?.apply && staleCount > 0) {
        const ids = (data ?? []).map((r: { id: unknown }) => r.id)
        const { error } = await supabase.from('leads').update({ status: 'archived' }).in('id', ids)
        if (!error) archived = staleCount
      }
      ctx.log(`${staleCount} stale${input?.apply ? `, archived ${archived}` : ' (report-only)'}`)
      return { staleCount, archived }
    } catch (e) { ctx.log(`no DB: ${String(e).slice(0, 60)}`); return { staleCount: 0, archived: 0 } }
  },
}

export const ADMIN_AGENTS: Agent[] = [systemHealthAgent, errorReviewAgent, automationAuditAgent, crmHygieneAgent]
