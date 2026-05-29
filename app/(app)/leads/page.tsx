import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { getActiveHubScope } from '@/lib/crm/hub-scope'

export const dynamic = 'force-dynamic'

const SLUG_TO_LANE: Record<string, string> = {
  'colvin-enterprises': 'colvin_enterprises',
  'music-theory-secrets': 'music_theory_secrets',
  'indiana-backflow': 'indiana_backflow',
  'first-keys-indy': 'first_keys_indy',
  'funding-ready-indiana': 'funding_ready_indiana',
}

async function hubScopeToLane(scope: string | null): Promise<string | null> {
  if (!scope) return null
  const supabase = createAdminClient()
  try {
    const { data } = await supabase.from('hubs').select('slug').eq('id', scope).maybeSingle()
    const slug = data?.slug ?? scope
    return SLUG_TO_LANE[slug] ?? null
  } catch { return null }
}

const LANE_LABELS: Record<string, string> = {
  colvin_enterprises: 'Colvin Enterprises',
  music_theory_secrets: 'Music Theory Secrets',
  indiana_backflow: 'Indiana Backflow',
  first_keys_indy: 'First Keys Indy',
  funding_ready_indiana: 'Funding Ready',
}

const STATUS_COLOR: Record<string, string> = {
  new: 'var(--accent)',
  contacted: 'var(--state-warning)',
  replied: '#a78bfa',
  converted: 'var(--state-success)',
  archived: 'var(--text-dim)',
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
}: { searchParams: Promise<{ lane?: string; status?: string }> }) {
  const params = await searchParams
  const { lane: queryLane, status } = params

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
    <div className="min-h-screen">
      <div className="px-10 pt-10 pb-6">
        <div className="max-w-5xl">
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Leads</h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--text-body)' }}>
            {leads.length} lead{leads.length === 1 ? '' : 's'} — sourced and scored by Gabriel · nothing is contacted without approval
          </p>

          <div className="flex gap-1 mt-5 flex-wrap">
            <Link href="/leads" className="text-[12px] px-2.5 py-1 rounded transition-colors"
              style={{ color: !lane && !status ? 'var(--text-primary)' : 'var(--text-body)', background: !lane && !status ? 'var(--bg-elevated)' : 'var(--bg-panel)' }}>
              All
            </Link>
            {statuses.map(s => (
              <Link key={s} href={`/leads?status=${s}${lane ? `&lane=${lane}` : ''}`}
                className="text-[12px] px-2.5 py-1 rounded transition-colors capitalize"
                style={{ color: status === s ? 'var(--text-primary)' : 'var(--text-body)', background: status === s ? 'var(--bg-elevated)' : 'var(--bg-panel)' }}>
                {s}
              </Link>
            ))}
            <span className="mx-2" style={{ borderLeft: '1px solid var(--border-subtle)' }} />
            {lanes.map(l => (
              <Link key={l} href={`/leads?lane=${l}${status ? `&status=${status}` : ''}`}
                className="text-[12px] px-2.5 py-1 rounded transition-colors"
                style={{ color: lane === l ? 'var(--text-primary)' : 'var(--text-body)', background: lane === l ? 'var(--bg-elevated)' : 'var(--bg-panel)' }}>
                {LANE_LABELS[l] ?? l}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="px-10 pb-12">
        <div className="max-w-5xl">
          {fetchError && (
            <div className="rounded px-4 py-3 text-[13px]" style={{ color: 'var(--state-danger)', background: 'rgba(248, 113, 113, 0.05)' }}>
              Error loading leads: {fetchError}
            </div>
          )}

          {leads.length === 0 && !fetchError ? (
            <div className="py-12 text-center text-[13px]" style={{ color: 'var(--text-dim)' }}>
              No leads for this filter — Gabriel adds new ones each morning at 7 AM CST
            </div>
          ) : (
            <div className="space-y-1">
              {leads.map(lead => (
                <div key={lead.id} className="rounded p-4" style={{ background: 'var(--bg-panel)' }}>
                  <div className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: STATUS_COLOR[lead.status] ?? 'var(--text-muted)' }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-3 flex-wrap">
                        <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{lead.name || lead.company || '—'}</span>
                        {lead.qualification_score > 0 && (
                          <span className="text-[11px] tabular-nums" style={{
                            color: lead.qualification_score >= 8 ? 'var(--state-success)'
                              : lead.qualification_score >= 6 ? 'var(--state-warning)' : 'var(--state-danger)'
                          }}>
                            {lead.qualification_score}/10
                          </span>
                        )}
                        <span className="text-[11px]" style={{ color: STATUS_COLOR[lead.status] ?? 'var(--text-muted)' }}>{lead.status}</span>
                        {lead.lane && (
                          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                            {LANE_LABELS[lead.lane] ?? lead.lane}
                          </span>
                        )}
                        <span className="text-[10px] ml-auto" style={{ color: 'var(--text-dim)' }}>
                          {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      {(lead.title || lead.company) && lead.name && (
                        <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                          {[lead.title, lead.company].filter(Boolean).join(' · ')}
                        </p>
                      )}

                      {lead.fit_reason && (
                        <p className="text-[12px] mt-2 leading-relaxed" style={{ color: 'var(--text-body)' }}>{lead.fit_reason}</p>
                      )}

                      <div className="flex flex-wrap gap-x-4 mt-2 text-[11px]">
                        {lead.linkedin_url && (
                          <a href={lead.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
                            LinkedIn →
                          </a>
                        )}
                        {lead.email && <span className="font-mono" style={{ color: 'var(--text-muted)' }}>{lead.email}</span>}
                        {lead.source && <span style={{ color: 'var(--text-dim)' }}>via {lead.source}</span>}
                      </div>

                      {lead.notes && (
                        <p className="text-[11px] mt-2 pt-2 leading-relaxed" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)' }}>
                          {lead.notes}
                        </p>
                      )}

                      <div className="mt-3">
                        <Link href={`/outreach?lead_id=${lead.id}`} className="text-[11px]" style={{ color: 'var(--accent)' }}>
                          View outreach drafts →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
