// ─── Human Review Gateway ───────────────────────────────────────────────────
// Terminal stage of every pipeline that produces something Alfred must approve.
// Nothing in the mesh publishes/sends — it lands here as a pending review ticket.
// Phase 0: records tickets (Supabase `review_tickets`, best-effort + local JSONL)
// and returns them. Later phases wire this to the approvals UI + Telegram.

import * as fs from 'fs'
import * as path from 'path'
import { randomUUID } from 'crypto'

export interface ReviewItem {
  lane: string
  kind: string                 // 'infographic' | 'video' | 'outreach' | 'post' | ...
  title: string
  summary?: string
  payload: unknown             // the actual draft/blueprint/asset refs
  katrina_review_required?: boolean
}

export interface ReviewTicket extends ReviewItem {
  id: string
  status: 'pending_review'
  created_at: string
  run_id?: string
}

const LOG_DIR = path.resolve(process.cwd(), 'logs')
const LOG_FILE = path.join(LOG_DIR, 'review_tickets.jsonl')

export async function submitForReview(
  items: ReviewItem[],
  opts: { runId?: string } = {},
): Promise<ReviewTicket[]> {
  const tickets: ReviewTicket[] = items.map((it) => ({
    ...it,
    id: randomUUID(),
    status: 'pending_review',
    created_at: new Date().toISOString(),
    run_id: opts.runId,
  }))

  // Local JSONL — always works.
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true })
    for (const t of tickets) fs.appendFileSync(LOG_FILE, JSON.stringify(t) + '\n')
  } catch { /* non-fatal */ }

  // Supabase — best-effort.
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabase = createAdminClient()
    await supabase.from('review_tickets').insert(
      tickets.map((t) => ({
        id: t.id, lane: t.lane, kind: t.kind, title: t.title, summary: t.summary ?? null,
        payload: t.payload, status: t.status, run_id: t.run_id ?? null,
        katrina_review_required: t.katrina_review_required ?? false, created_at: t.created_at,
      })),
    )
  } catch { /* table may not exist yet — fine */ }

  return tickets
}
