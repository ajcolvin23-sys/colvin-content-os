import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import OutreachActions from '@/components/outreach/OutreachActions'

export const dynamic = 'force-dynamic'

const LANE_LABELS: Record<string, string> = {
  colvin_enterprises: '⚡ Colvin Enterprises',
  music_theory_secrets: '🎹 Music Theory Secrets',
  indiana_backflow: '💧 Indiana Backflow',
  first_keys_indy: '🏠 First Keys Indy',
  funding_ready_indiana: '💰 Funding Ready',
}

const MESSAGE_TYPE_LABELS: Record<string, string> = {
  linkedin_connection: 'LinkedIn Connection',
  linkedin_followup: 'LinkedIn Follow-up',
  email: 'Email',
}

const STATUS_STYLES: Record<string, string> = {
  pending_review: 'bg-yellow-900/50 text-yellow-300 border border-yellow-700/50',
  approved: 'bg-green-900/50 text-green-300 border border-green-700/50',
  revised: 'bg-blue-900/50 text-blue-300 border border-blue-700/50',
  rejected: 'bg-red-900/50 text-red-400 border border-red-700/50',
  sent: 'bg-emerald-900/50 text-emerald-300 border border-emerald-700/50',
  archived: 'bg-gray-800 text-gray-500 border border-gray-700',
}

async function getOutreachDrafts(status?: string, leadId?: string) {
  const supabase = createAdminClient()
  let query = supabase
    .from('outreach_drafts')
    .select('id, lead_id, lead_name, lead_company, lane, message_type, draft, priority_score, compliance_flags, katrina_review_required, status, alfred_feedback, revision_count, created_at')
    .order('priority_score', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(100)

  if (status) query = query.eq('status', status)
  if (leadId) query = query.eq('lead_id', leadId)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data || []
}

export default async function OutreachPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; lead_id?: string }>
}) {
  const params = await searchParams
  const { status, lead_id } = params

  let drafts: Awaited<ReturnType<typeof getOutreachDrafts>> = []
  let fetchError = ''
  try {
    drafts = await getOutreachDrafts(status, lead_id)
  } catch (e) {
    fetchError = String(e)
  }

  const statuses = ['pending_review', 'approved', 'revised', 'rejected', 'sent']
  const pendingCount = drafts.filter(d => d.status === 'pending_review').length
  const katinaFlagCount = drafts.filter(d => d.katrina_review_required).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Outreach Queue</h1>
        <p className="text-gray-400 text-sm mt-1">
          {drafts.length} draft{drafts.length !== 1 ? 's' : ''} — Gabriel wrote these.
          Nothing sends without your approval. Review each draft before marking approved.
        </p>
      </div>

      {/* Safety notice */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-xs text-gray-400 flex items-center gap-2">
        <span className="text-gray-300">🔒</span>
        <span>Auto-send is disabled. Every draft requires manual approval before anything leaves this system.</span>
      </div>

      {/* Katrina gate notice */}
      {katinaFlagCount > 0 && (
        <div className="bg-orange-950/30 border border-orange-700/60 rounded-xl px-4 py-3 text-sm text-orange-300 flex items-center gap-2">
          <span>⚠</span>
          <span>{katinaFlagCount} draft{katinaFlagCount !== 1 ? 's' : ''} flagged for Katrina compliance review before use.</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/outreach"
          className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${!status && !lead_id ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-500'}`}
        >
          All ({drafts.length})
        </Link>
        {statuses.map(s => (
          <Link
            key={s}
            href={`/outreach?status=${s}`}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors capitalize ${status === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-500'}`}
          >
            {s.replace('_', ' ')}
            {s === 'pending_review' && pendingCount > 0 && (
              <span className="ml-1.5 bg-yellow-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingCount}</span>
            )}
          </Link>
        ))}
      </div>

      {fetchError && (
        <div className="bg-red-950/30 border border-red-700 rounded-xl p-4 text-red-400 text-sm">
          Error loading outreach drafts: {fetchError}
        </div>
      )}

      {drafts.length === 0 && !fetchError && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-500 text-sm">No outreach drafts found for this filter.</p>
          <p className="text-gray-600 text-xs mt-1">Gabriel generates outreach drafts during the daily run at 7 AM CST.</p>
        </div>
      )}

      {/* Draft cards */}
      <div className="space-y-4">
        {drafts.map((draft) => (
          <div key={draft.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors">
            {/* Header */}
            <div className="px-5 py-4 flex items-start justify-between gap-4 border-b border-gray-800">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-white text-sm">{draft.lead_name ?? 'Unknown'}</span>
                  {draft.lead_company && (
                    <span className="text-gray-500 text-xs">· {draft.lead_company}</span>
                  )}
                  {draft.priority_score > 0 && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                      draft.priority_score >= 8
                        ? 'text-emerald-400 bg-emerald-950/50 border-emerald-700/50'
                        : draft.priority_score >= 6
                        ? 'text-yellow-400 bg-yellow-950/50 border-yellow-700/50'
                        : 'text-gray-400 bg-gray-800 border-gray-700'
                    }`}>{draft.priority_score}/10</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded ${STATUS_STYLES[draft.status] ?? STATUS_STYLES.pending_review}`}>
                    {draft.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                    {MESSAGE_TYPE_LABELS[draft.message_type] ?? draft.message_type}
                  </span>
                  {draft.lane && (
                    <span className="text-xs text-gray-600">{LANE_LABELS[draft.lane] ?? draft.lane}</span>
                  )}
                  {draft.katrina_review_required && (
                    <span className="text-xs text-orange-400 bg-orange-950/30 border border-orange-700/40 px-2 py-0.5 rounded">
                      ⚠ Katrina review required
                    </span>
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-600 shrink-0">
                {new Date(draft.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>

            {/* Draft body */}
            <div className="px-5 py-4">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">{draft.draft}</pre>
            </div>

            {/* Compliance flags */}
            {Array.isArray(draft.compliance_flags) && draft.compliance_flags.length > 0 && (
              <div className="px-5 pb-3">
                <div className="bg-orange-950/20 border border-orange-800/40 rounded-lg px-3 py-2 text-xs text-orange-400">
                  <span className="font-semibold">Compliance flags: </span>
                  {(draft.compliance_flags as string[]).join(', ')}
                </div>
              </div>
            )}

            {/* Alfred feedback */}
            {draft.alfred_feedback && (
              <div className="px-5 pb-3">
                <div className="bg-blue-950/20 border border-blue-800/40 rounded-lg px-3 py-2 text-xs text-blue-300">
                  <span className="font-semibold">Your notes: </span>{draft.alfred_feedback}
                </div>
              </div>
            )}

            {/* Inline approve / reject / revise actions */}
            <div className="px-5 pb-4">
              <OutreachActions
                draftId={draft.id}
                currentStatus={draft.status}
                katinaRequired={draft.katrina_review_required ?? false}
                leadName={draft.lead_name ?? 'Unknown'}
              />
              {draft.lead_id && (
                <Link
                  href={`/leads`}
                  className="mt-2 inline-block text-xs text-gray-600 hover:text-gray-400 transition-colors"
                >
                  View all leads →
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
