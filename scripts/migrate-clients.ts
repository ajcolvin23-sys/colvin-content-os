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

async function main() {
  // Step 1: Find Colvin Enterprises hub id (will be the parent)
  const { data: colvin } = await supabase
    .from('hubs')
    .select('id, name')
    .eq('slug', 'colvin-enterprises')
    .maybeSingle()
  if (!colvin) { console.error('Colvin Enterprises hub not found'); process.exit(1) }
  console.log(`Colvin Enterprises id: ${colvin.id}`)

  // Step 2: Find Urban Legacy Day hub id
  const { data: uld } = await supabase
    .from('hubs')
    .select('id, name')
    .eq('slug', 'urban-legacy-day')
    .maybeSingle()
  if (!uld) { console.error('Urban Legacy Day hub not found'); process.exit(1) }
  console.log(`Urban Legacy Day id: ${uld.id}`)

  // Step 3: Verify the parent_hub_id column exists by trying an update
  const { error: updateErr } = await supabase
    .from('hubs')
    .update({ parent_hub_id: colvin.id })
    .eq('id', uld.id)

  if (updateErr) {
    console.error('Update failed:', updateErr.message)
    console.error('You need to run this SQL in Supabase first:')
    console.error('')
    console.error("  ALTER TABLE hubs ADD COLUMN IF NOT EXISTS parent_hub_id uuid REFERENCES hubs(id) ON DELETE SET NULL;")
    console.error("  NOTIFY pgrst, 'reload schema';")
    process.exit(1)
  }

  console.log(`✅ Urban Legacy Day → parent_hub_id set to Colvin Enterprises`)
}

main().catch(e => { console.error('FAIL:', e.message); process.exit(1) })
