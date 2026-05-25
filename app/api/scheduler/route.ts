import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { publishToFacebook, type PublishResult } from '@/lib/platforms'
import { logAction } from '@/lib/audit'

// Called by Vercel cron: "0 13,23 * * *" (8am + 6pm EST)
export async function POST(req: NextRequest) {
  // Cron secret check
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date()

  // Find approved+scheduled items due now (within 15-minute window)
  const windowStart = new Date(now.getTime() - 15 * 60 * 1000).toISOString()
  const windowEnd = new Date(now.getTime() + 5 * 60 * 1000).toISOString()

  const { data: items, error } = await supabase
    .from('content_items')
    .select('*, platform_accounts(*)')
    .eq('status', 'scheduled')
    .gte('scheduled_at', windowStart)
    .lte('scheduled_at', windowEnd)
    .lt('retry_count', 3)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!items?.length) return NextResponse.json({ processed: 0, message: 'No items due' })

  const results = []

  for (const item of items) {
    try {
      // Check platform auto_publish flag — safety gate
      const account = Array.isArray(item.platform_accounts) ? item.platform_accounts[0] : item.platform_accounts
      if (!account?.auto_publish) {
        await supabase
          .from('content_items')
          .update({ status: 'manual_required', error_message: 'Auto-publish not enabled for this account', updated_at: new Date().toISOString() })
          .eq('id', item.id)
        await logAction('schedule_skip', 'content_item', item.id, item.title, { reason: 'auto_publish_disabled' })
        results.push({ id: item.id, result: 'manual_required' })
        continue
      }

      let publishResult: PublishResult = { success: false, manual_required: true, reason: 'Platform not configured' }

      if (item.platform === 'facebook') {
        publishResult = await publishToFacebook(
          item.caption || item.body || '',
          account?.account_id_on_platform || process.env.FACEBOOK_PAGE_ID || ''
        )
      }
      // Add other platforms as they get wired up

      if (publishResult.success && 'platform_post_id' in publishResult) {
        await supabase.from('content_items').update({
          status: 'published',
          published_at: new Date().toISOString(),
          platform_post_id: publishResult.platform_post_id,
          updated_at: new Date().toISOString(),
        }).eq('id', item.id)
        await logAction('publish', 'content_item', item.id, item.title, { platform: item.platform })
        results.push({ id: item.id, result: 'published' })
      } else {
        const newRetry = (item.retry_count || 0) + 1
        const nextStatus = newRetry >= 3 ? 'manual_required' : 'scheduled'
        await supabase.from('content_items').update({
          status: nextStatus,
          retry_count: newRetry,
          error_message: publishResult.reason,
          updated_at: new Date().toISOString(),
        }).eq('id', item.id)
        await logAction('publish_fail', 'content_item', item.id, item.title, { reason: publishResult.reason, retry: newRetry })
        results.push({ id: item.id, result: nextStatus, reason: publishResult.reason })
      }
    } catch (err) {
      console.error('[scheduler] item error', item.id, err)
      await supabase.from('content_items').update({
        status: 'failed',
        error_message: String(err),
        retry_count: (item.retry_count || 0) + 1,
        updated_at: new Date().toISOString(),
      }).eq('id', item.id)
      results.push({ id: item.id, result: 'failed' })
    }
  }

  return NextResponse.json({ processed: items.length, results })
}
