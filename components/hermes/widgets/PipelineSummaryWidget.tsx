import { createAdminClient } from '@/lib/supabase/admin'
import { WidgetShell, WidgetEmpty } from './WidgetShell'

interface Opp { id: string; title: string; amount: number; stage: string; probability: number }

export async function PipelineSummaryWidget({ hubId }: { hubId: string; hubSlug: string; hubColor: string | null }) {
  let opps: Opp[] = []
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('revenue_opportunities')
      .select('id, title, amount, stage, probability')
      .eq('hub_id', hubId)
      .neq('stage', 'Won')
      .neq('stage', 'Lost')
      .order('amount', { ascending: false })
      .limit(8)
    opps = (data ?? []) as Opp[]
  } catch { /* empty */ }

  const total = opps.reduce((s, o) => s + (o.amount ?? 0), 0)
  const weighted = opps.reduce((s, o) => s + ((o.amount ?? 0) * (o.probability ?? 0) / 100), 0)

  return (
    <WidgetShell title="Pipeline" meta={`${opps.length} active`}>
      <div className="grid grid-cols-2 gap-4 mb-4 pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div>
          <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Total</div>
          <div className="text-xl font-semibold tracking-tight mt-1" style={{ color: 'var(--text-primary)' }}>
            ${total.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Weighted</div>
          <div className="text-xl font-semibold tracking-tight mt-1" style={{ color: 'var(--text-primary)' }}>
            ${Math.round(weighted).toLocaleString()}
          </div>
        </div>
      </div>
      {opps.length === 0 ? (
        <WidgetEmpty message="No active opportunities" />
      ) : (
        <div>
          {opps.slice(0, 5).map(opp => (
            <div key={opp.id} className="flex items-center gap-3 py-1.5">
              <div className="flex-1 text-[12px] truncate" style={{ color: 'var(--text-primary)' }}>
                {opp.title}
              </div>
              <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{opp.stage}</div>
              <div className="text-[12px] tabular-nums" style={{ color: 'var(--text-body)' }}>
                ${opp.amount?.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </WidgetShell>
  )
}
