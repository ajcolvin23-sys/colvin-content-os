// POST /api/publish/linkedin-sent
// Marks a LinkedIn post or outreach draft as sent (manual confirmation flow).
// Used by the /linkedin client UI after the user pastes + posts on LinkedIn.

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const body = await request.json() as { id?: string; kind?: 'post' | 'outreach' }
    const { id, kind } = body

    if (!id || !kind) {
      return NextResponse.json({ error: 'Missing id or kind' }, { status: 400 })
    }
    if (kind !== 'post' && kind !== 'outreach') {
      return NextResponse.json({ error: 'kind must be "post" or "outreach"' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const now = new Date().toISOString()

    if (kind === 'post') {
      // Update content_items: mark as published
      const { error } = await supabase
        .from('content_items')
        .update({
          status: 'published',
          published_at: now,
          platform_account_id: 'manual-linkedin-post',
        })
        .eq('id', id)
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    } else {
      // Update outreach_drafts: mark as sent
      const { error } = await supabase
        .from('outreach_drafts')
        .update({ status: 'sent', updated_at: now })
        .eq('id', id)
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    // Also log to hermes_agent_logs for visibility
    try {
      await supabase.from('hermes_agent_logs').insert({
        agent_name: 'linkedin-manual',
        action_taken: `Marked LinkedIn ${kind} ${id} as sent`,
        result: 'success',
        confidence_level: 'verified',
        human_review_required: false,
      })
    } catch { /* logging is best-effort */ }

    return NextResponse.json({ ok: true, id, kind, at: now })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    )
  }
}
