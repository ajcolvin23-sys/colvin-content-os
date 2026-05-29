import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'; import * as path from 'path'
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) { const t = line.trim(); if (!t || t.startsWith('#')) continue; const i = t.indexOf('='); if (i < 0) continue; if (!process.env[t.slice(0, i).trim()]) process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim() }
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
async function main() {
  for (const table of ['campaigns', 'ai_usage_logs']) {
    const { error } = await supabase.from(table).insert({ __probe__: 'x' } as never)
    console.log(`${table}: probe error code=${error?.code} message=${error?.message?.slice(0, 300)}`)
  }
}
main().catch(e => console.error(e.message))
