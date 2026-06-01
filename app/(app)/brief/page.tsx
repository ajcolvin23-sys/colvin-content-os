import { createAdminClient } from '@/lib/supabase/admin'
import { MorningBriefClient } from './MorningBriefClient'

export const dynamic = 'force-dynamic'

export interface BriefItem {
  id: string
  kind: 'content' | 'outreach'
  lane: string
  platform?: string | null
  message_type?: string | null
  title?: string | null
  body: string
  status: string
  katrina_required?: boolean
  created_at: string
}

async function loadYesterdayAndToday(): Promise<BriefItem[]> {
  try {
    const supabase = createAdminClient()
    const twentyFourHoursAgo = new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString()

    const [contentRes, outreachRes] = await Promise.all([
      supabase
        .from('content_items')
        .select('id, lane, platform, title, hook, body, caption, status, katrina_review_required, created_at')
        .in('status', ['needs_review', 'draft', 'manual_required'])
        .gte('created_at', twentyFourHoursAgo)
        .order('created_at', { ascending: false }),
      supabase
        .from('outreach_drafts')
        .select('id, lane, message_type, subject, body, status, created_at')
        .eq('status', 'pending_review')
        .gte('created_at', twentyFourHoursAgo)
        .order('created_at', { ascending: false }),
    ])

    const items: BriefItem[] = []
    for (const c of contentRes.data ?? []) {
      const composed = [
        c.hook,
        c.body && c.body !== c.hook ? c.body : null,
        c.caption && c.caption !== c.body ? c.caption : null,
      ].filter(Boolean).join('\n\n')
      items.push({
        id: c.id, kind: 'content', lane: c.lane ?? 'unknown',
        platform: c.platform, title: c.title,
        body: composed || c.caption || '',
        status: c.status, katrina_required: Boolean(c.katrina_review_required),
        created_at: c.created_at,
      })
    }
    for (const o of outreachRes.data ?? []) {
      items.push({
        id: o.id, kind: 'outreach', lane: o.lane ?? 'unknown',
        message_type: o.message_type, title: o.subject ?? o.message_type,
        body: o.body ?? '',
        status: o.status, created_at: o.created_at,
      })
    }
    return items
  } catch { return [] }
}

export default async function MorningBriefPage() {
  const items = await loadYesterdayAndToday()
  return <MorningBriefClient initialItems={items} />
}
