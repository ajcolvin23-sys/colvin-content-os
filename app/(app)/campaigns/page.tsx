import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { getActiveHubScope, getHubLabel } from '@/lib/crm/hub-scope'

export const dynamic = 'force-dynamic'

const STATUS_COLOR: Record<string, string> = {
  'Planning': 'var(--text-muted)',
  'Active': 'var(--state-success)',
  'Paused': 'var(--state-warning)',
  'Completed': 'var(--text-muted)',
}

async function getCampaigns(scope: string | null) {
  try {
    const supabase = createAdminClient()
    let query = supabase
      .from('campaigns')
      .select(`id, name, goal, audience, offer, start_date, end_date, status, metrics, created_at, hub_id,
        hubs!campaigns_hub_id_fkey (id, name, slug, color)`)
      .order('created_at', { ascending: false })
    if (scope) query = query.eq('hub_id', scope)
    const { data, error } = await query
    if (error) return []
    return data ?? []
  } catch { return [] }
}

export default async function CampaignsPage() {
  const scope = await getActiveHubScope()
  const scopeLabel = await getHubLabel(scope)
  const campaigns = await getCampaigns(scope) as Record<string, unknown>[]

  return (
    <div className="min-h-screen">
      <div className="px-10 pt-10 pb-6">
        <div className="max-w-5xl">
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Campaigns</h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--text-body)' }}>
            {scope ? `${scopeLabel} · ` : ''}{campaigns.length} campaign{campaigns.length === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      <div className="px-10 pb-12">
        <div className="max-w-5xl">
          {campaigns.length === 0 ? (
            <div className="py-12 text-center text-[13px]" style={{ color: 'var(--text-dim)' }}>No campaigns yet</div>
          ) : (
            <div className="space-y-1">
              {campaigns.map(c => {
                const hub = c.hubs as Record<string, unknown> | null
                const status = c.status as string
                return (
                  <div key={c.id as string} className="rounded p-4" style={{ background: 'var(--bg-panel)' }}>
                    <div className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: STATUS_COLOR[status] ?? 'var(--text-muted)' }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-3 flex-wrap">
                          <h3 className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{c.name as string}</h3>
                          <span className="text-[11px]" style={{ color: STATUS_COLOR[status] ?? 'var(--text-muted)' }}>{status}</span>
                          {hub && (
                            <Link href={`/h/${String(hub.slug)}`} className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                              {hub.name as string}
                            </Link>
                          )}
                        </div>
                        {Boolean(c.goal) && (
                          <p className="text-[12px] mt-1.5" style={{ color: 'var(--text-body)' }}>{c.goal as string}</p>
                        )}
                        <div className="flex flex-wrap gap-x-4 mt-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          {Boolean(c.audience) && <span>Audience: {c.audience as string}</span>}
                          {Boolean(c.offer) && <span>Offer: {c.offer as string}</span>}
                          {Boolean(c.start_date) && <span>Start: {c.start_date as string}</span>}
                          {Boolean(c.end_date) && <span>End: {c.end_date as string}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
