import { createAdminClient } from '@/lib/supabase/admin'
import { WidgetShell, WidgetEmpty } from './WidgetShell'

interface Opp { id: string; title: string; amount: number; stage: string; probability: number; notes: string | null }

const TIERS = [
  { name: 'Diamond', amount: 10000, color: '#e0e7ff' },
  { name: 'Platinum', amount: 7500, color: '#cbd5e1' },
  { name: 'Gold', amount: 5000, color: '#fbbf24' },
  { name: 'Silver', amount: 4000, color: '#9ca3af' },
  { name: 'Bronze', amount: 2500, color: '#a16207' },
]

export async function SponsorPipelineWidget({ hubId }: { hubId: string; hubSlug: string; hubColor: string | null }) {
  let opps: Opp[] = []
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('revenue_opportunities')
      .select('id, title, amount, stage, probability, notes')
      .eq('hub_id', hubId)
      .neq('stage', 'Lost')
      .order('amount', { ascending: false })
    opps = (data ?? []) as Opp[]
  } catch { /* empty */ }

  // Group by sponsor tier (heuristic: match amount to nearest tier)
  const tierCounts = TIERS.map(tier => ({
    ...tier,
    won: opps.filter(o => o.amount >= tier.amount && o.amount < tier.amount * 1.4 && o.stage === 'Won').length,
    pipeline: opps.filter(o => o.amount >= tier.amount && o.amount < tier.amount * 1.4 && o.stage !== 'Won').length,
  }))

  const wonTotal = opps.filter(o => o.stage === 'Won').reduce((s, o) => s + (o.amount ?? 0), 0)
  const pipelineTotal = opps.filter(o => o.stage !== 'Won').reduce((s, o) => s + (o.amount ?? 0), 0)

  return (
    <WidgetShell title="Sponsor Pipeline" meta={`$${wonTotal.toLocaleString()} secured`}>
      {opps.length === 0 ? (
        <WidgetEmpty message="No sponsors in pipeline yet" />
      ) : (
        <div>
          <div className="grid grid-cols-2 gap-4 pb-4 mb-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Secured</div>
              <div className="text-xl font-semibold tracking-tight mt-1" style={{ color: 'var(--state-success)' }}>
                ${wonTotal.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>In pipeline</div>
              <div className="text-xl font-semibold tracking-tight mt-1" style={{ color: 'var(--text-primary)' }}>
                ${pipelineTotal.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            {tierCounts.map(tier => (
              <div key={tier.name} className="flex items-center gap-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: tier.color }} />
                <span className="flex-1 text-[12px]" style={{ color: 'var(--text-primary)' }}>
                  {tier.name}
                </span>
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  ${tier.amount.toLocaleString()}
                </span>
                <span className="text-[11px] w-12 text-right" style={{ color: tier.won > 0 ? 'var(--state-success)' : 'var(--text-muted)' }}>
                  {tier.won} won
                </span>
                <span className="text-[11px] w-16 text-right" style={{ color: 'var(--text-muted)' }}>
                  {tier.pipeline} active
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </WidgetShell>
  )
}
