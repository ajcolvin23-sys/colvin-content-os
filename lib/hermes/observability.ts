// ─── Mesh observability (Phase 5) ───────────────────────────────────────────
// Aggregates agent runs for the dashboard. Reads Supabase `agent_runs` when
// available, falls back to the local logs/agent_runs.jsonl (dev). Server-only.

import * as fs from 'fs'
import * as path from 'path'
import { registerMeshAgents, ALL_AGENTS } from './agents'
import { describeAgents } from './registry'

export interface AgentRow {
  name: string
  kind: string
  taskType?: string
  description?: string
  runs: number
  okRate: number
  lastStatus: string | null
  lastAt: string | null
  avgLatencyMs: number
}

interface RawRun { agent: string; status: string; latency_ms?: number; created_at?: string }

async function loadRuns(): Promise<RawRun[]> {
  // Try Supabase first
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const { data, error } = await createAdminClient().from('agent_runs').select('agent, status, latency_ms, created_at').order('created_at', { ascending: false }).limit(2000)
    if (!error && data && data.length) return data as RawRun[]
  } catch { /* fall through */ }
  // Local JSONL fallback (dev). File is append-ordered (oldest→newest); reverse
  // to newest-first so it matches the Supabase path (rs[0] = most recent run).
  try {
    const file = path.resolve(process.cwd(), 'logs/agent_runs.jsonl')
    const rows = fs.readFileSync(file, 'utf8').trim().split('\n').map((l) => { try { return JSON.parse(l) as RawRun } catch { return null } }).filter(Boolean) as RawRun[]
    return rows.reverse()
  } catch { return [] }
}

export interface MeshSnapshot {
  agents: AgentRow[]
  totals: { agents: number; runs: number; okRate: number }
}

export async function getMeshSnapshot(): Promise<MeshSnapshot> {
  registerMeshAgents()
  const meta = describeAgents()
  const runs = await loadRuns()

  const byAgent = new Map<string, RawRun[]>()
  for (const r of runs) { const a = byAgent.get(r.agent) ?? []; a.push(r); byAgent.set(r.agent, a) }

  const agents: AgentRow[] = meta.map((m) => {
    const rs = byAgent.get(m.name) ?? []
    const ok = rs.filter((r) => r.status === 'ok').length
    const lats = rs.map((r) => r.latency_ms).filter((n): n is number => typeof n === 'number')
    return {
      name: m.name, kind: m.kind, taskType: m.taskType, description: m.description,
      runs: rs.length,
      okRate: rs.length ? Math.round((ok / rs.length) * 100) : 0,
      lastStatus: rs[0]?.status ?? null,
      lastAt: rs[0]?.created_at ?? null,
      avgLatencyMs: lats.length ? Math.round(lats.reduce((a, b) => a + b, 0) / lats.length) : 0,
    }
  }).sort((a, b) => a.name.localeCompare(b.name))

  const totalOk = runs.filter((r) => r.status === 'ok').length
  return {
    agents,
    totals: { agents: ALL_AGENTS.length, runs: runs.length, okRate: runs.length ? Math.round((totalOk / runs.length) * 100) : 0 },
  }
}
