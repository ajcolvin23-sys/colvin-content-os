import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { getActiveHubScope, getHubLabel } from '@/lib/crm/hub-scope'

export const dynamic = 'force-dynamic'

const STAGES = ['New', 'Discovery', 'Proposal', 'Negotiation', 'Verbal Yes', 'Won', 'Lost', 'Nurture']

async function getRevenue(scope: string | null) {
  try {
    const supabase = createAdminClient()
    let query = supabase
      .from('revenue_opportunities')
      .select(`id, title, amount, stage, probability, close_date, notes, created_at, hub_id,
        hubs!revenue_opportunities_hub_id_fkey (id, name, slug, color)`)
      .order('amount', { ascending: false })
    if (scope) query = query.eq('hub_id', scope)
    const { data, error } = await query
    if (error) return []
    return data ?? []
  } catch { return [] }
}

export default async function RevenuePage() {
  const scope = await getActiveHubScope()
  const scopeLabel = await getHubLabel(scope)
  const allOpps = await getRevenue(scope) as Record<string, unknown>[]

  const activeOpps = allOpps.filter(o => !['Won', 'Lost'].includes(o.stage as string))
  const pipelineTotal = activeOpps.reduce((s, o) => s + ((o.amount as number) ?? 0), 0)
  const weightedTotal = activeOpps.reduce((s, o) => s + (((o.amount as number) ?? 0) * ((o.probability as number) ?? 0) / 100), 0)
  const wonTotal = allOpps.filter(o => o.stage === 'Won').reduce((s, o) => s + ((o.amount as number) ?? 0), 0)

  const stageCounts = STAGES.map(s => ({
    stage: s,
    count: allOpps.filter(o => o.stage === s).length,
    total: allOpps.filter(o => o.stage === s).reduce((sum, o) => sum + ((o.amount as number) ?? 0), 0),
  }))

  return (
    <div className="min-h-screen">
      <div className="px-10 pt-10 pb-6">
        <div className="max-w-5xl">
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Revenue</h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--text-body)' }}>
            {scope ? `${scopeLabel} · ` : ''}{activeOpps.length} active opportunities
          </p>
        </div>
      </div>

      <div className="px-10 pb-12">
        <div className="max-w-5xl">
          {/* Top stats */}
          <div className="grid grid-cols-3 gap-x-6 gap-y-5 pb-8 mb-8" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <div className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Total pipeline</div>
              <div className="text-2xl font-semibold tracking-tight mt-1" style={{ color: 'var(--text-primary)' }}>
                ${pipelineTotal.toLocaleString()}
              </div>
              <div className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>{activeOpps.length} opportunities</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Weighted</div>
              <div className="text-2xl font-semibold tracking-tight mt-1" style={{ color: 'var(--text-primary)' }}>
                ${Math.round(weightedTotal).toLocaleString()}
              </div>
              <div className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>probability-adjusted</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Won</div>
              <div className="text-2xl font-semibold tracking-tight mt-1" style={{ color: 'var(--state-success)' }}>
                ${wonTotal.toLocaleString()}
              </div>
              <div className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                {allOpps.filter(o => o.stage === 'Won').length} closed
              </div>
            </div>
          </div>

          {/* Stage funnel */}
          {allOpps.length > 0 && (
            <div className="rounded p-5 mb-8" style={{ background: 'var(--bg-panel)' }}>
              <h2 className="text-[13px] font-semibold tracking-tight mb-4" style={{ color: 'var(--text-primary)' }}>
                Pipeline by stage
              </h2>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                {stageCounts.map(({ stage, count, total }) => (
                  <div key={stage} className="text-center">
                    <div className="text-lg font-semibold tracking-tight" style={{ color: count > 0 ? 'var(--text-primary)' : 'var(--text-dim)' }}>{count}</div>
                    <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{stage}</div>
                    {total > 0 && (
                      <div className="text-[10px] mt-0.5 tabular-nums" style={{ color: 'var(--text-body)' }}>
                        ${total.toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {allOpps.length === 0 ? (
            <div className="py-12 text-center text-[13px]" style={{ color: 'var(--text-dim)' }}>No revenue opportunities yet</div>
          ) : (
            <div className="rounded" style={{ background: 'var(--bg-panel)' }}>
              {allOpps.map(opp => {
                const hub = opp.hubs as Record<string, unknown> | null
                return (
                  <div key={opp.id as string} className="flex items-center gap-4 px-5 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    {hub && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: (hub.color as string) ?? '#6b6b6b' }} />}
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] truncate" style={{ color: 'var(--text-primary)' }}>{opp.title as string}</div>
                      {Boolean(opp.notes) && (
                        <div className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{opp.notes as string}</div>
                      )}
                    </div>
                    {hub && (
                      <Link href={`/h/${hub.slug as string}`} className="text-[11px] hidden md:block" style={{ color: 'var(--text-muted)' }}>
                        {hub.name as string}
                      </Link>
                    )}
                    <span className="text-[11px] w-24" style={{ color: 'var(--text-muted)' }}>{opp.stage as string}</span>
                    <span className="text-[11px] w-12 text-right" style={{ color: 'var(--text-muted)' }}>{opp.probability as number}%</span>
                    <span className="text-[13px] w-24 text-right tabular-nums" style={{ color: 'var(--text-primary)' }}>
                      ${(opp.amount as number)?.toLocaleString()}
                    </span>
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
