import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAction } from '@/lib/audit'
import { publishToFacebook, type PublishResult } from '@/lib/platforms'

const ApprovalSchema = z.object({
  action: z.enum(['approve', 'reject', 'schedule', 'publish_now', 'mark_manual']),
  content_item_id: z.string().uuid(),
  scheduled_at: z.string().optional(),
  notes: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = ApprovalSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const { action, content_item_id, scheduled_at } = parsed.data
    const supabase = createAdminClient()

    // Get content item
    const { data: item, error: fetchErr } = await supabase
      .from('content_items')
      .select('*')
      .eq('id', content_item_id)
      .single()

    if (fetchErr || !item) return NextResponse.json({ error: 'Content item not found' }, { status: 404 })

    let newStatus: string
    let updateFields: Record<string, unknown> = {}

    switch (action) {
      case 'approve':
        newStatus = 'approved'
        updateFields = { status: 'approved' }
        break

      case 'reject':
        newStatus = 'draft'
        updateFields = { status: 'draft' }
        break

      case 'schedule':
        if (!scheduled_at) return NextResponse.json({ error: 'scheduled_at required for schedule action' }, { status: 400 })
        newStatus = 'scheduled'
        updateFields = { status: 'scheduled', scheduled_at }
        break

      case 'mark_manual':
        newStatus = 'manual_required'
        updateFields = { status: 'manual_required' }
        break

      case 'publish_now': {
        // Safety gate: check platform account has auto_publish enabled
        let publishResult: PublishResult = { success: false, manual_required: true, reason: 'Platform not configured' }

        if (item.platform === 'facebook') {
          publishResult = await publishToFacebook(
            item.caption || item.body || '',
            process.env.FACEBOOK_PAGE_ID || ''
          )
        }
        // Other platforms: fall through to manual_required

        if (publishResult.success && 'platform_post_id' in publishResult) {
          newStatus = 'published'
          updateFields = {
            status: 'published',
            published_at: new Date().toISOString(),
            platform_post_id: publishResult.platform_post_id,
          }
        } else {
          newStatus = 'manual_required'
          updateFields = {
            status: 'manual_required',
            error_message: publishResult.reason,
          }
        }
        break
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }

    const { data: updated, error: updateErr } = await supabase
      .from('content_items')
      .update({ ...updateFields, updated_at: new Date().toISOString() })
      .eq('id', content_item_id)
      .select()
      .single()

    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })
    await logAction(action, 'content_item', content_item_id, item.title, { new_status: newStatus })

    return NextResponse.json({ success: true, item: updated, status: newStatus })
  } catch (err) {
    console.error('[approvals]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
