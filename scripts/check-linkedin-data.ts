import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'; import * as path from 'path'
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) { const t = line.trim(); if (!t || t.startsWith('#')) continue; const i = t.indexOf('='); if (i < 0) continue; if (!process.env[t.slice(0, i).trim()]) process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim() }
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
async function main() {
  // Check LinkedIn content drafts
  const { count: liContentCount } = await supabase.from('content_items').select('*', { count: 'exact', head: true }).eq('platform', 'linkedin')
  console.log('LinkedIn content drafts:', liContentCount ?? 0)
  // Check LinkedIn outreach drafts
  const { count: liOutreachCount } = await supabase.from('outreach_drafts').select('*', { count: 'exact', head: true }).ilike('message_type', '%linkedin%')
  console.log('LinkedIn outreach drafts:', liOutreachCount ?? 0)
  // Show structure of recent LinkedIn content
  const { data: sample } = await supabase.from('content_items').select('*').eq('platform', 'linkedin').limit(1)
  console.log('Sample LinkedIn content fields:', sample?.[0] ? Object.keys(sample[0]) : 'none')
  // Check outreach_drafts structure
  const { data: sampleOutreach } = await supabase.from('outreach_drafts').select('*').limit(1)
  console.log('Sample outreach_drafts fields:', sampleOutreach?.[0] ? Object.keys(sampleOutreach[0]) : 'none')
}
main().catch(e => console.error(e.message))
