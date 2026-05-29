import { createAdminClient } from '@/lib/supabase/admin'
import { WidgetShell, WidgetEmpty } from './WidgetShell'

interface Opp {
  id: string
  title: string
  amount: number
  stage: string
  probability: number
  close_date: string | null
  notes: string | null
}

export async function PendingProposalsWidget({ hubId }: { hubId: string; hubSlug: string; hubColor: string | null }) {
  let opps: Opp[] = []
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('revenue_opportunities')
      .select('id, title, amount, stage, probability, close_date, notes')
      .eq('hub_id', hubId)
      .in('stage', ['Proposal', 'Negotiation', 'Verbal Yes'])
      .order('amount', { ascending: false })
      .limit(8)
    opps = (data ?? []) as Opp[]
  } catch { /* empty */ }

  const today = new Date().toISOString().split('T')[0]
  const total = opps.reduce((s, o) => s + (o.amount ?? 0), 0)
  const weighted = opps.reduce((s, o) => s + ((o.amount ?? 0) * (o.probability ?? 0) / 100), 0)

  return (
    <WidgetShell title="Pending Proposals" meta={opps.length > 0 ? `$${Math.round(weighted).toLocaleString()} weighted` : 'None'}>
      {opps.length === 0 ? (
        <WidgetEmpty message="No proposals out yet" />
      ) : (
        <div>
          {opps.map(opp => {
            const overdue = opp.close_date && opp.close_date < today
            return (
              <div key={opp.id} className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] truncate" style={{ color: 'var(--text-primary)' }}>{opp.title}</div>
                  <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {opp.stage} · {opp.probability}%
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[12px] tabular-nums" style={{ color: 'var(--text-primary)' }}>
                    ${opp.amount?.toLocaleString()}
                  </div>
                  {opp.close_date && (
                    <div className="text-[10px] mt-0.5" style={{ color: overdue ? 'var(--state-danger)' : 'var(--text-muted)' }}>
                      {opp.close_date}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Pipeline value</span>
            <span className="text-[12px] tabular-nums" style={{ color: 'var(--text-primary)' }}>
              ${total.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </WidgetShell>
  )
}
