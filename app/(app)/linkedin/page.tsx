import { createAdminClient } from '@/lib/supabase/admin'
import { LinkedInClient } from './LinkedInClient'

export const dynamic = 'force-dynamic'

async function getLinkedInPosts() {
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('content_items')
      .select('id, lane, content_type, title, hook, body, caption, cta, hashtags, status, scheduled_at, published_at, katrina_review_required, created_at')
      .eq('platform', 'linkedin')
      .order('created_at', { ascending: false })
      .limit(60)
    return (data ?? []) as Record<string, unknown>[]
  } catch { return [] }
}

async function getLinkedInOutreach() {
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('outreach_drafts')
      .select('id, lane, message_type, subject, body, status, created_at')
      .ilike('message_type', '%linkedin%')
      .order('created_at', { ascending: false })
      .limit(50)
    return (data ?? []) as Record<string, unknown>[]
  } catch { return [] }
}

export default async function LinkedInPage() {
  const [posts, outreach] = await Promise.all([
    getLinkedInPosts(),
    getLinkedInOutreach(),
  ])

  return <LinkedInClient initialPosts={posts} initialOutreach={outreach} />
}
