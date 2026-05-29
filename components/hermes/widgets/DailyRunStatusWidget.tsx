import { createAdminClient } from '@/lib/supabase/admin'
import { WidgetShell, WidgetEmpty } from './WidgetShell'

interface RunRecord {
  session_date: string
  leads_found: number | null
  outreach_drafted: number | null
  content_generated: number | null
  top_actions: string[] | null
  run_errors: string[] | null
}

export async function DailyRunStatusWidget() {
  let runs: RunRecord[] = []
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('gabriel_memory')
      .select('session_date, leads_found, outreach_drafted, content_generated, top_actions, run_errors')
      .order('session_date', { ascending: false })
      .limit(7)
    runs = (data ?? []) as RunRecord[]
  } catch { /* empty */ }

  const latest = runs[0]
  const totalLeads = runs.reduce((s, r) => s + (r.leads_found ?? 0), 0)
  const totalDrafts = runs.reduce((s, r) => s + (r.outreach_drafted ?? 0), 0)
  const totalContent = runs.reduce((s, r) => s + (r.content_generated ?? 0), 0)

  return (
    <WidgetShell title="Gabriel Daily Run" meta={latest ? new Date(latest.session_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No runs yet'}>
      {!latest ? (
        <WidgetEmpty message="No daily run yet — Vercel cron triggers at 13:00 UTC" />
      ) : (
        <div>
          <div className="grid grid-cols-3 gap-4 pb-4 mb-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Leads / 7d</div>
              <div className="text-lg font-semibold tracking-tight mt-0.5" style={{ color: 'var(--text-primary)' }}>{totalLeads}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Drafts / 7d</div>
              <div className="text-lg font-semibold tracking-tight mt-0.5" style={{ color: 'var(--text-primary)' }}>{totalDrafts}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Content / 7d</div>
              <div className="text-lg font-semibold tracking-tight mt-0.5" style={{ color: 'var(--text-primary)' }}>{totalContent}</div>
            </div>
          </div>
          {latest.top_actions && latest.top_actions.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Today's top actions</div>
              {latest.top_actions.slice(0, 3).map((action, i) => (
                <div key={i} className="text-[12px] py-1" style={{ color: 'var(--text-primary)' }}>
                  {action}
                </div>
              ))}
            </div>
          )}
          {latest.run_errors && latest.run_errors.length > 0 && (
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--state-danger)' }}>Errors</div>
              {latest.run_errors.slice(0, 2).map((err, i) => (
                <div key={i} className="text-[11px] py-0.5" style={{ color: 'var(--state-danger)' }}>{err}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </WidgetShell>
  )
}
