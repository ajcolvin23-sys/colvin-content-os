import { createAdminClient } from '@/lib/supabase/admin'
import { WidgetShell } from './WidgetShell'

const STAGES = [
  { key: 'new', label: 'Inquiry' },
  { key: 'contacted', label: 'Qualifying' },
  { key: 'replied', label: 'Engaged' },
  { key: 'converted', label: 'Application' },
]

export async function BuyerFunnelWidget({ hubSlug }: { hubId: string; hubSlug: string; hubColor: string | null }) {
  const laneMap: Record<string, string> = {
    'first-keys-indy': 'first_keys_indy',
    'funding-ready-indiana': 'funding_ready_indiana',
  }
  const lane = laneMap[hubSlug] ?? hubSlug.replace(/-/g, '_')

  let leads: { status: string }[] = []
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('leads')
      .select('status')
      .eq('lane', lane)
      .limit(1000)
    leads = (data ?? []) as { status: string }[]
  } catch { /* empty */ }

  const counts = STAGES.map(s => ({
    ...s,
    count: leads.filter(l => l.status === s.key).length,
  }))
  const total = counts.reduce((sum, c) => sum + c.count, 0)
  const max = Math.max(...counts.map(c => c.count), 1)

  return (
    <WidgetShell title="Buyer Funnel" meta={`${total} total`}>
      {total === 0 ? (
        <div className="py-6 text-center text-[12px]" style={{ color: 'var(--text-dim)' }}>
          No buyers in funnel yet
        </div>
      ) : (
        <div className="space-y-3">
          {counts.map(stage => {
            const pct = (stage.count / max) * 100
            const conversionPct = total > 0 ? Math.round((stage.count / total) * 100) : 0
            return (
              <div key={stage.key}>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-[12px]" style={{ color: 'var(--text-primary)' }}>{stage.label}</span>
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    {stage.count} · {conversionPct}%
                  </span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: 'var(--accent)' }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </WidgetShell>
  )
}
