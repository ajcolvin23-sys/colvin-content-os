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

import { HUBS_SEED, TASKS_SEED, RESEARCH_SEED, PROMPTS_SEED, AUTOMATIONS_SEED, REVENUE_SEED } from '@/lib/crm/seed-data'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  console.log('Seeding Hermes CRM directly via service role...\n')

  // 1. Check hubs is empty
  const { count: existingCount } = await supabase.from('hubs').select('*', { count: 'exact', head: true })
  if ((existingCount ?? 0) > 0) {
    console.log(`Already seeded — ${existingCount} hubs exist. Skipping to keep data safe.`)
    return
  }

  // 2. Insert hubs
  const { data: insertedHubs, error: hubError } = await supabase.from('hubs').insert(HUBS_SEED).select('id, slug')
  if (hubError) { console.error('HUBS INSERT FAILED:', hubError.message); process.exit(1) }
  console.log(`✅ ${insertedHubs?.length} hubs inserted`)

  // 3. Build slug → id map
  const slugToId = new Map<string, string>()
  for (const h of insertedHubs ?? []) slugToId.set(h.slug, h.id)

  // 4. Insert tasks (use hub_slug → resolve to hub_id)
  const tasksWithIds = TASKS_SEED
    .map(t => ({ ...t, hub_id: slugToId.get(t.hub_slug) ?? null, hub_slug: undefined }))
    .filter(t => t.hub_id)
    .map(({ hub_slug, ...rest }) => rest)
  if (tasksWithIds.length > 0) {
    const { error } = await supabase.from('crm_tasks').insert(tasksWithIds)
    if (error) console.warn('  tasks failed:', error.message)
    else console.log(`✅ ${tasksWithIds.length} tasks inserted`)
  }

  // 5. Research notes
  const researchWithIds = RESEARCH_SEED
    .map(r => ({ ...r, hub_id: slugToId.get(r.hub_slug) ?? null, hub_slug: undefined }))
    .filter(r => r.hub_id)
    .map(({ hub_slug, ...rest }) => rest)
  if (researchWithIds.length > 0) {
    const { error } = await supabase.from('research_notes').insert(researchWithIds)
    if (error) console.warn('  research failed:', error.message)
    else console.log(`✅ ${researchWithIds.length} research notes inserted`)
  }

  // 6. Prompts
  const promptsWithIds = PROMPTS_SEED
    .map(p => ({ ...p, hub_id: slugToId.get(p.hub_slug) ?? null, hub_slug: undefined }))
    .filter(p => p.hub_id)
    .map(({ hub_slug, ...rest }) => rest)
  if (promptsWithIds.length > 0) {
    const { error } = await supabase.from('prompts').insert(promptsWithIds)
    if (error) console.warn('  prompts failed:', error.message)
    else console.log(`✅ ${promptsWithIds.length} prompts inserted`)
  }

  // 7. Automations
  const autosWithIds = AUTOMATIONS_SEED
    .map(a => ({ ...a, hub_id: slugToId.get(a.hub_slug) ?? null, hub_slug: undefined }))
    .filter(a => a.hub_id)
    .map(({ hub_slug, ...rest }) => rest)
  if (autosWithIds.length > 0) {
    const { error } = await supabase.from('crm_automations').insert(autosWithIds)
    if (error) console.warn('  automations failed:', error.message)
    else console.log(`✅ ${autosWithIds.length} automations inserted`)
  }

  // 8. Revenue opportunities
  const revenueWithIds = REVENUE_SEED
    .map(r => ({ ...r, hub_id: slugToId.get(r.hub_slug) ?? null, hub_slug: undefined }))
    .filter(r => r.hub_id)
    .map(({ hub_slug, ...rest }) => rest)
  if (revenueWithIds.length > 0) {
    const { error } = await supabase.from('revenue_opportunities').insert(revenueWithIds)
    if (error) console.warn('  revenue failed:', error.message)
    else console.log(`✅ ${revenueWithIds.length} revenue opportunities inserted`)
  }

  console.log('\n🎉 Seed complete.')
}

main().catch(e => { console.error('FAIL:', e.message); process.exit(1) })
