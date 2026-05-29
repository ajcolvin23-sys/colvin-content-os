import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'; import * as path from 'path'
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) { const t = line.trim(); if (!t || t.startsWith('#')) continue; const i = t.indexOf('='); if (i < 0) continue; if (!process.env[t.slice(0, i).trim()]) process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim() }
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
async function main() {
  // What statuses do content_items actually have?
  const { data: c } = await supabase.from('content_items').select('status').limit(500)
  const statuses: Record<string, number> = {}
  for (const r of c ?? []) statuses[r.status] = (statuses[r.status] ?? 0) + 1
  console.log('CONTENT statuses across all items:')
  for (const [s, n] of Object.entries(statuses).sort((a, b) => b[1] - a[1])) console.log(`  ${s.padEnd(20)} ${n}`)
  // Same for outreach
  const { data: o } = await supabase.from('outreach_drafts').select('status').limit(500)
  const ostat: Record<string, number> = {}
  for (const r of o ?? []) ostat[r.status] = (ostat[r.status] ?? 0) + 1
  console.log('\nOUTREACH statuses:')
  for (const [s, n] of Object.entries(ostat).sort((a, b) => b[1] - a[1])) console.log(`  ${s.padEnd(20)} ${n}`)
  // Check if leads have status changes (any contacted/replied?)
  const { data: leads } = await supabase.from('leads').select('status').limit(500)
  const lstat: Record<string, number> = {}
  for (const r of leads ?? []) lstat[r.status] = (lstat[r.status] ?? 0) + 1
  console.log('\nLEADS statuses:')
  for (const [s, n] of Object.entries(lstat).sort((a, b) => b[1] - a[1])) console.log(`  ${s.padEnd(20)} ${n}`)
}
main().catch(e => console.error(e.message))
