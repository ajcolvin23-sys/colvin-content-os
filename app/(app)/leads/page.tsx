import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { getActiveHubScope } from '@/lib/crm/hub-scope'

export const dynamic = 'force-dynamic'

// Map hub slugs to Gabriel lane keys. The legacy leads table uses `lane` text
// (e.g. 'colvin_enterprises'), while hubs use slugs (e.g. 'colvin-enterprises').
// When a hub is selected in the sidebar, translate slug → lane.
const SLUG_TO_LANE: Record<string, string> = {
  'colvin-enterprises': 'colvin_enterprises',
  'music-theory-secrets': 'music_theory_secrets',
  'indiana-backflow': 'indiana_backflow',
  'first-keys-indy': 'first_keys_indy',
  'funding-ready-indiana': 'funding_ready_indiana',
  'first-keys-indy-video': 'first_keys_indy',
}

async function hubScopeToLane(scope: string | null): Promise<string | null> {
  if (!scope) return null
  // If scope is a UUID, look up the slug; else treat as slug directly
  const supabase = createAdminClient()
  try {
    const { data } = await supabase
      .from('hubs')
      .select('slug')
      .eq('id', scope)
      .maybeSingle()
    const slug = data?.slug ?? scope
    return SLUG_TO_LANE[slug] ?? null
  } catch {
    return null
  }
}

const LANE_LABELS: Record<string, string> = {
  colvin_enterprises: '⚡ Colvin Enterprises',
  music_theory_secrets: '🎹 Music Theory Secrets',
  indiana_backflow: '💧 Indiana Backflow',
  first_keys_indy: '🏠 First Keys Indy',
  funding_ready_indiana: '💰 Funding Ready',
}

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-blue-900/50 text-blue-300 border border-blue-700/50',
  contacted: 'bg-yellow-900/50 text-yellow-300 border border-yellow-700/50',
  replied: 'bg-purple-900/50 text-purple-300 border border-purple-700/50',
  converted: 'bg-emerald-900/50 text-emerald-300 border border-emerald-700/50',
  archived: 'bg-gray-800 text-gray-500 border border-gray-700',
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 8 ? 'text-emerald-400 bg-emerald-950/50 border-emerald-700/50' :
    score >= 6 ? 'text-yellow-400 bg-yellow-950/50 border-yellow-700/50' :
    'text-red-400 bg-red-950/50 border-red-700/50'
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${color}`}>{score}/10</span>
  )
}

async function getLeads(lane?: string, status?: string) {
  const supabase = createAdminClient()
  let query = supabase
    .from('leads')
    .select('id, name, company, title, linkedin_url, email, lane, fit_reason, qualification_score, source, status, last_contacted_at, notes, created_at')
    .order('qualification_score', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(200)

  if (lane) query = query.eq('lane', lane)
  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data || []
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ lane?: string; status?: string }>
}) {
  const params = await searchParams
  const { lane: queryLane, status } = params

  // URL-param lane takes precedence; otherwise inherit from sidebar hub scope
  const scope = await getActiveHubScope()
  const scopedLane = await hubScopeToLane(scope)
  const lane = queryLane ?? scopedLane ?? undefined

  let leads: Awaited<ReturnType<typeof getLeads>> = []
  let fetchError = ''
  try {
    leads = await getLeads(lane, status)
  } catch (e) {
    fetchError = String(e)
  }

  const lanes = ['colvin_enterprises', 'music_theory_secrets', 'indiana_backflow', 'first_keys_indy']
  const statuses = ['new', 'contacted', 'replied', 'converted', 'archived']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Lead Inbox</h1>
        <p className="text-gray-400 text-sm mt-1">
          {leads.length} lead{leads.length !== 1 ? 's' : ''} — sourced by Gabriel, scored and deduplicated.
          Nothing is contacted without your approval.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/leads"
          className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${!lane && !status ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-500'}`}
        >
          All
        </Link>
        {statuses.map(s => (
          <Link
            key={s}
            href={`/leads?status=${s}${lane ? `&lane=${lane}` : ''}`}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors capitalize ${status === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-500'}`}
          >
            {s}
          </Link>
        ))}
        <div className="w-px bg-gray-700 mx-1" />
        {lanes.map(l => (
          <Link
            key={l}
            href={`/leads?lane=${l}${status ? `&status=${status}` : ''}`}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${lane === l ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-500'}`}
          >
            {LANE_LABELS[l] ?? l}
          </Link>
        ))}
      </div>

      {fetchError && (
        <div className="bg-red-950/30 border border-red-700 rounded-xl p-4 text-red-400 text-sm">
          Error loading leads: {fetchError}
        </div>
      )}

      {leads.length === 0 && !fetchError && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-500 text-sm">No leads found for this filter.</p>
          <p className="text-gray-600 text-xs mt-1">Gabriel adds leads during the daily run at 7 AM CST.</p>
        </div>
      )}

      {/* Lead cards */}
      <div className="space-y-3">
        {leads.map((lead) => (
          <div key={lead.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-white text-sm">{lead.name}</span>
                  {lead.qualification_score > 0 && (
                    <ScoreBadge score={lead.qualification_score} />
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded ${STATUS_STYLES[lead.status] ?? STATUS_STYLES.new}`}>
                    {lead.status}
                  </span>
                  {lead.lane && (
                    <span className="text-xs text-gray-500">{LANE_LABELS[lead.lane] ?? lead.lane}</span>
                  )}
                </div>

                {(lead.title || lead.company) && (
                  <p className="text-gray-400 text-xs mt-1">
                    {[lead.title, lead.company].filter(Boolean).join(' · ')}
                  </p>
                )}

                {lead.fit_reason && (
                  <p className="text-gray-300 text-sm mt-2">{lead.fit_reason}</p>
                )}

                <div className="flex flex-wrap gap-3 mt-3">
                  {lead.linkedin_url && (
                    <a
                      href={lead.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300 underline"
                    >
                      LinkedIn →
                    </a>
                  )}
                  {lead.email && (
                    <span className="text-xs text-gray-400 font-mono">{lead.email}</span>
                  )}
                  {lead.source && (
                    <span className="text-xs text-gray-600">via {lead.source}</span>
                  )}
                </div>
              </div>

              <div className="text-xs text-gray-600 shrink-0 text-right">
                {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>

            {lead.notes && (
              <div className="mt-3 pt-3 border-t border-gray-800 text-xs text-gray-500">
                {lead.notes}
              </div>
            )}

            <div className="mt-3 flex gap-2">
              <Link
                href={`/outreach?lead_id=${lead.id}`}
                className="text-xs bg-blue-700 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                View Outreach Drafts
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
