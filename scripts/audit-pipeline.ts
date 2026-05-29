import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'; import * as path from 'path'
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) { const t = line.trim(); if (!t || t.startsWith('#')) continue; const i = t.indexOf('='); if (i < 0) continue; if (!process.env[t.slice(0, i).trim()]) process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim() }
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const LANES = ['colvin_enterprises', 'music_theory_secrets', 'indiana_backflow', 'first_keys_indy', 'funding_ready_indiana', 'piano_app', 'youtube_music', 'girls_got_game', 'glory_engine']
const SEVEN = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
const THIRTY = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

async function main() {
  console.log('\n=== LEAD GEN — last 7 / 30 days ===')
  for (const lane of LANES) {
    const [{ count: c7 }, { count: c30 }] = await Promise.all([
      supabase.from('leads').select('*', { count: 'exact', head: true }).eq('lane', lane).gte('created_at', SEVEN),
      supabase.from('leads').select('*', { count: 'exact', head: true }).eq('lane', lane).gte('created_at', THIRTY),
    ])
    console.log(`  ${lane.padEnd(28)} 7d=${(c7 ?? 0).toString().padStart(3)}  30d=${(c30 ?? 0).toString().padStart(3)}`)
  }

  console.log('\n=== OUTREACH DRAFTS — last 7 / 30 days ===')
  for (const lane of LANES) {
    const [{ count: c7 }, { count: c30 }, { count: sent }] = await Promise.all([
      supabase.from('outreach_drafts').select('*', { count: 'exact', head: true }).eq('lane', lane).gte('created_at', SEVEN),
      supabase.from('outreach_drafts').select('*', { count: 'exact', head: true }).eq('lane', lane).gte('created_at', THIRTY),
      supabase.from('outreach_drafts').select('*', { count: 'exact', head: true }).eq('lane', lane).eq('status', 'sent'),
    ])
    console.log(`  ${lane.padEnd(28)} 7d=${(c7 ?? 0).toString().padStart(3)}  30d=${(c30 ?? 0).toString().padStart(3)}  sent_alltime=${(sent ?? 0).toString().padStart(3)}`)
  }

  console.log('\n=== CONTENT DRAFTS — last 7 / 30 days, by lane+platform ===')
  for (const lane of LANES) {
    const { data } = await supabase.from('content_items').select('platform, status').eq('lane', lane).gte('created_at', SEVEN)
    if (!data || data.length === 0) { console.log(`  ${lane.padEnd(28)} (none in 7d)`); continue }
    const byPlat: Record<string, number> = {}
    const byStatus: Record<string, number> = {}
    for (const r of data) {
      byPlat[r.platform ?? 'unknown'] = (byPlat[r.platform ?? 'unknown'] ?? 0) + 1
      byStatus[r.status] = (byStatus[r.status] ?? 0) + 1
    }
    console.log(`  ${lane.padEnd(28)} 7d=${data.length} platforms=${JSON.stringify(byPlat)} status=${JSON.stringify(byStatus)}`)
  }

  console.log('\n=== PUBLISHED CONTENT ALL TIME (by lane) ===')
  for (const lane of LANES) {
    const { count } = await supabase.from('content_items').select('*', { count: 'exact', head: true }).eq('lane', lane).eq('status', 'published')
    console.log(`  ${lane.padEnd(28)} ${count ?? 0}`)
  }

  console.log('\n=== GABRIEL DAILY RUN MEMORY — last 5 runs ===')
  const { data: runs } = await supabase.from('gabriel_memory').select('session_date, leads_found, outreach_drafted, content_generated, run_errors').order('session_date', { ascending: false }).limit(5)
  for (const r of runs ?? []) {
    const errs = (r.run_errors as string[] | null)?.length ?? 0
    console.log(`  ${r.session_date}  leads=${r.leads_found ?? 0}  drafts=${r.outreach_drafted ?? 0}  content=${r.content_generated ?? 0}  errors=${errs}`)
  }

  console.log('\n=== AGENT ACTIVITY — last 7 days (by agent) ===')
  const { data: logs } = await supabase.from('hermes_agent_logs').select('agent_name').gte('created_at', SEVEN)
  const agentCounts: Record<string, number> = {}
  for (const l of logs ?? []) agentCounts[l.agent_name ?? 'unknown'] = (agentCounts[l.agent_name ?? 'unknown'] ?? 0) + 1
  const sorted = Object.entries(agentCounts).sort((a, b) => b[1] - a[1])
  for (const [agent, count] of sorted.slice(0, 10)) console.log(`  ${agent.padEnd(28)} ${count}`)
  if (sorted.length === 0) console.log('  (no agent logs in last 7 days)')

  console.log('\n=== AI USAGE COST — last 7 days (by task_type) ===')
  const { data: usage } = await supabase.from('ai_usage_logs').select('task_type, cost_usd, provider, model').gte('created_at', SEVEN)
  const taskCosts: Record<string, { cost: number; calls: number }> = {}
  let totalCost = 0
  for (const u of usage ?? []) {
    const k = taskCosts[u.task_type] ?? { cost: 0, calls: 0 }
    k.cost += u.cost_usd ?? 0
    k.calls++
    taskCosts[u.task_type] = k
    totalCost += u.cost_usd ?? 0
  }
  for (const [t, s] of Object.entries(taskCosts).sort((a, b) => b[1].cost - a[1].cost)) {
    console.log(`  ${t.padEnd(28)} calls=${s.calls.toString().padStart(4)}  cost=$${s.cost.toFixed(3)}`)
  }
  console.log(`  TOTAL                        $${totalCost.toFixed(2)} / 7d`)
}

main().catch(e => console.error(e.message))
