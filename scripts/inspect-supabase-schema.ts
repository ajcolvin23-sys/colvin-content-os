import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim(); if (!t || t.startsWith('#')) continue
    const i = t.indexOf('='); if (i < 0) continue
    if (!process.env[t.slice(0, i).trim()]) process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim()
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const TARGET_TABLES = [
  'hubs','projects','crm_tasks','campaigns','research_notes','prompts',
  'crm_automations','revenue_opportunities','hermes_agent_logs',
  'hermes_approvals','ai_usage_logs',
]

async function main() {
  console.log('Checking which Hermes tables already exist in your Supabase...\n')
  for (const t of TARGET_TABLES) {
    // Try a zero-row select to test existence + read columns
    const { data, error } = await supabase.from(t).select('*').limit(1)
    if (error) {
      if (error.code === '42P01' || (error.message || '').includes('does not exist')) {
        console.log(`  [ ] ${t.padEnd(28)} DOES NOT EXIST`)
      } else {
        console.log(`  [?] ${t.padEnd(28)} ERROR: ${error.code} ${error.message?.slice(0, 60)}`)
      }
      continue
    }
    // Get column names from the result (rest mode returns column metadata in headers, but here we can use the data shape)
    if (data && data.length > 0) {
      const cols = Object.keys(data[0])
      console.log(`  [x] ${t.padEnd(28)} EXISTS (${data.length} row) columns=${cols.join(',')}`)
    } else {
      // Empty table — need to introspect differently. Try a HEAD request workaround
      console.log(`  [x] ${t.padEnd(28)} EXISTS (empty)`)
    }
  }
}

main().catch(e => { console.error('FAIL:', e.message); process.exit(1) })
