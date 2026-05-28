import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateOutreachDraft } from '@/lib/ai/generate'
import { logAction } from '@/lib/audit'

// ── PATCH /api/outreach — approve, reject, revise, or mark sent on outreach_drafts ──

const PatchSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(['approve', 'reject', 'revise', 'mark_sent']),
  feedback: z.string().max(1000).optional(),
})

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = PatchSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const { id, action, feedback } = parsed.data
    const supabase = createAdminClient()

    // Fetch current draft
    const { data: draft, error: fetchErr } = await supabase
      .from('outreach_drafts')
      .select('id, lead_name, lane, status, revision_count, katrina_review_required')
      .eq('id', id)
      .single()

    if (fetchErr || !draft) {
      return NextResponse.json({ error: 'Outreach draft not found' }, { status: 404 })
    }

    // Safety: cannot approve a Katrina-gated draft without feedback acknowledging it
    if (action === 'approve' && draft.katrina_review_required && !feedback) {
      return NextResponse.json({
        error: 'This draft requires Katrina compliance review. Add a confirmation note before approving.',
        code: 'katrina_gate',
      }, { status: 403 })
    }

    // Safety: cannot mark a draft sent without it being approved first
    if (action === 'mark_sent' && draft.status !== 'approved') {
      return NextResponse.json({
        error: 'Only approved drafts can be marked as sent.',
        code: 'not_approved',
      }, { status: 409 })
    }

    const statusMap: Record<string, string> = {
      approve: 'approved',
      reject: 'rejected',
      revise: 'revised',
      mark_sent: 'sent',
    }

    const updateFields: Record<string, unknown> = {
      status: statusMap[action],
      updated_at: new Date().toISOString(),
    }
    if (feedback) updateFields.alfred_feedback = feedback
    if (action === 'revise') updateFields.revision_count = (draft.revision_count ?? 0) + 1

    const { data: updated, error: updateErr } = await supabase
      .from('outreach_drafts')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single()

    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

    await logAction(
      `outreach_draft_${action}`,
      'outreach_draft',
      id,
      draft.lead_name ?? 'Unknown',
      { lane: draft.lane, previous_status: draft.status, new_status: statusMap[action], feedback }
    )

    return NextResponse.json({ success: true, draft: updated })
  } catch (err) {
    console.error('[outreach PATCH]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

const ProspectSchema = z.object({
  platform: z.string().default('linkedin'),
  name: z.string().min(1),
  company: z.string().optional(),
  title: z.string().optional(),
  profile_url: z.string().optional(),
  location: z.string().optional(),
  industry: z.string().optional(),
  verified_signal: z.string().optional(),
  pain_hypothesis: z.string().optional(),
  offer_fit: z.string().optional(),
  source: z.string().optional(),
  generate_drafts: z.boolean().optional().default(true),
})

export async function GET(req: NextRequest) {
  const supabase = createAdminClient()
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  let query = supabase
    .from('outreach_prospects')
    .select('*, outreach_messages(*)')
    .order('created_at', { ascending: false })
    .limit(50)

  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = ProspectSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const supabase = createAdminClient()
    const { generate_drafts, ...prospectData } = parsed.data

    // Create prospect
    const { data: prospect, error: prospErr } = await supabase
      .from('outreach_prospects')
      .insert(prospectData)
      .select()
      .single()

    if (prospErr) return NextResponse.json({ error: prospErr.message }, { status: 500 })

    let drafts = null

    // Auto-generate connection request + follow-up drafts
    if (generate_drafts) {
      const generated = await generateOutreachDraft({
        name: prospectData.name,
        company: prospectData.company,
        title: prospectData.title,
        verified_signal: prospectData.verified_signal,
        pain_hypothesis: prospectData.pain_hypothesis,
        offer_fit: prospectData.offer_fit,
      })

      // Save drafts — never auto-approved
      await supabase.from('outreach_messages').insert([
        {
          prospect_id: prospect.id,
          message_type: 'connection_request',
          body: generated.connection_request,
          status: 'draft',
          notes: generated.risk_notes,
        },
        {
          prospect_id: prospect.id,
          message_type: 'follow_up_1',
          body: generated.follow_up,
          status: 'draft',
        },
      ])

      drafts = generated
    }

    await logAction('create', 'outreach_prospect', prospect.id, prospect.name, {
      platform: prospect.platform,
      generated_drafts: !!drafts,
    })

    return NextResponse.json({ prospect, drafts }, { status: 201 })
  } catch (err) {
    console.error('[outreach]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
