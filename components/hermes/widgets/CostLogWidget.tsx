import { createAdminClient } from '@/lib/supabase/admin'
import { WidgetShell, WidgetEmpty } from './WidgetShell'

interface UsageRow {
  provider: string
  model: string
  task_type: string
  input_tokens: number
  output_tokens: number
  cost_usd: number
  created_at: string
}

export async function CostLogWidget() {
  let rows: UsageRow[] = []
  try {
    const supabase = createAdminClient()
    const start = new Date()
    start.setUTCHours(0, 0, 0, 0)
    start.setUTCDate(start.getUTCDate() - 6)
    const { data } = await supabase
      .from('ai_usage_logs')
      .select('provider, model, task_type, input_tokens, output_tokens, cost_usd, created_at')
      .gte('created_at', start.toISOString())
      .order('created_at', { ascending: false })
      .limit(500)
    rows = (data ?? []) as UsageRow[]
  } catch { /* empty */ }

  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)
  const today = rows.filter(r => new Date(r.created_at) >= todayStart)
  const todayCost = today.reduce((s, r) => s + (r.cost_usd ?? 0), 0)
  const weekCost = rows.reduce((s, r) => s + (r.cost_usd ?? 0), 0)
  const claudeCalls = rows.filter(r => r.provider === 'anthropic').length
  const openaiCalls = rows.filter(r => r.provider === 'openai').length

  // Group by model
  const byModel = new Map<string, { calls: number; cost: number }>()
  for (const r of rows) {
    const m = byModel.get(r.model) ?? { calls: 0, cost: 0 }
    m.calls++
    m.cost += r.cost_usd ?? 0
    byModel.set(r.model, m)
  }
  const topModels = [...byModel.entries()].sort((a, b) => b[1].cost - a[1].cost).slice(0, 4)

  return (
    <WidgetShell title="AI Cost Log" meta={rows.length > 0 ? `${rows.length} calls / 7d` : 'No usage yet'}>
      {rows.length === 0 ? (
        <WidgetEmpty message="No AI calls logged in last 7 days" />
      ) : (
        <div>
          <div className="grid grid-cols-2 gap-4 pb-4 mb-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Today</div>
              <div className="text-xl font-semibold tracking-tight mt-1" style={{ color: 'var(--text-primary)' }}>
                ${todayCost.toFixed(2)}
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{today.length} calls</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>7 days</div>
              <div className="text-xl font-semibold tracking-tight mt-1" style={{ color: 'var(--text-primary)' }}>
                ${weekCost.toFixed(2)}
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {claudeCalls} Claude · {openaiCalls} GPT
              </div>
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>By model</div>
            {topModels.map(([model, stats]) => (
              <div key={model} className="flex items-center gap-3 py-1">
                <div className="flex-1 text-[12px] truncate" style={{ color: 'var(--text-primary)' }}>{model}</div>
                <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{stats.calls}</div>
                <div className="text-[12px] tabular-nums" style={{ color: 'var(--text-body)' }}>${stats.cost.toFixed(3)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </WidgetShell>
  )
}
