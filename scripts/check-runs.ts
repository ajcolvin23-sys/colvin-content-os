import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'; import * as path from 'path'
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) { const t = line.trim(); if (!t || t.startsWith('#')) continue; const i = t.indexOf('='); if (i < 0) continue; if (!process.env[t.slice(0, i).trim()]) process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim() }
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
async function main() {
  const { data: mem } = await supabase.from('gabriel_memory').select('*').order('session_date', { ascending: false }).limit(3)
  console.log('GABRIEL MEMORY rows:', mem?.length ?? 0)
  if (mem) for (const r of mem) {
    console.log(' Date:', r.session_date, 'leads:', r.leads_found, 'drafts:', r.outreach_drafted, 'content:', r.content_generated)
    if (r.top_actions) console.log('   top_actions:', JSON.stringify(r.top_actions).slice(0, 200))
  }
  const { count: ai } = await supabase.from('ai_usage_logs').select('*', { count: 'exact', head: true })
  console.log('\nAI usage logs alltime:', ai ?? 0)
  const { count: ag } = await supabase.from('hermes_agent_logs').select('*', { count: 'exact', head: true })
  console.log('Hermes agent logs alltime:', ag ?? 0)
  // Check workflow_runs for actual daily run history
  const { count: wf, data: wfData } = await supabase.from('workflow_runs').select('id, workflow_name, status, started_at', { count: 'exact' }).order('started_at', { ascending: false }).limit(5)
  console.log('\nworkflow_runs total:', wf ?? 0)
  if (wfData) for (const r of wfData) console.log('  ', r.started_at, r.workflow_name, r.status)
}
main().catch(e => console.error(e.message))
