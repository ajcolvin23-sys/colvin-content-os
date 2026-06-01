// POST /api/brief/action — bulk approve/reject from the Morning Brief keyboard UI
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface Body {
  id?: string
  kind?: 'content' | 'outreach'
  action?: 'approve' | 'reject'
}

export async function POST(req: Request) {
  try {
    const { id, kind, action } = (await req.json()) as Body
    if (!id || !kind || !action) {
      return NextResponse.json({ error: 'Missing id, kind, or action' }, { status: 400 })
    }
    const supabase = createAdminClient()
    const now = new Date().toISOString()

    if (kind === 'content') {
      const newStatus = action === 'approve' ? 'approved' : 'archived'
      const { error } = await supabase
        .from('content_items')
        .update({ status: newStatus, updated_at: now })
        .eq('id', id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    } else {
      const newStatus = action === 'approve' ? 'approved' : 'archived'
      const { error } = await supabase
        .from('outreach_drafts')
        .update({ status: newStatus, updated_at: now })
        .eq('id', id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }

    try {
      await supabase.from('hermes_agent_logs').insert({
        agent_name: 'morning-brief',
        action_taken: `${action} ${kind} ${id}`,
        result: 'success',
        confidence_level: 'verified',
        human_review_required: false,
      })
    } catch { /* logging best-effort */ }

    return NextResponse.json({ ok: true, id, kind, action })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    )
  }
}
