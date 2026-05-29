import { createAdminClient } from '@/lib/supabase/admin'
import { WidgetShell } from './WidgetShell'

const INDIANA_COUNTIES_TOTAL = 92

interface Lead { id: string; location: string | null; status: string }

export async function CountyCoverageWidget({ hubId }: { hubId: string; hubSlug: string; hubColor: string | null }) {
  let testers: Lead[] = []
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('leads')
      .select('id, location, status')
      .eq('hub_id', hubId)
      .limit(500)
    testers = (data ?? []) as Lead[]
  } catch { /* empty */ }

  const counties = new Set<string>()
  testers.forEach(t => {
    if (t.location) {
      const c = t.location.match(/([A-Z][a-z]+)\s+County/)?.[1]
      if (c) counties.add(c)
    }
  })
  const coveredCount = counties.size
  const pct = Math.round((coveredCount / INDIANA_COUNTIES_TOTAL) * 100)

  return (
    <WidgetShell title="County Coverage" meta={`${coveredCount} of 92 counties`}>
      <div className="grid grid-cols-2 gap-4 pb-4 mb-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div>
          <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Covered</div>
          <div className="text-xl font-semibold tracking-tight mt-1" style={{ color: 'var(--text-primary)' }}>
            {coveredCount}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Of state</div>
          <div className="text-xl font-semibold tracking-tight mt-1" style={{ color: 'var(--text-primary)' }}>
            {pct}%
          </div>
        </div>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: 'var(--bg-elevated)' }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--accent)' }} />
      </div>
      <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
        {INDIANA_COUNTIES_TOTAL - coveredCount} counties still need certified testers
      </div>
    </WidgetShell>
  )
}
