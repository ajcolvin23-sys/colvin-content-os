import { createAdminClient } from '@/lib/supabase/admin'
import { WidgetShell, WidgetEmpty } from './WidgetShell'

interface Task {
  id: string
  title: string
  due_date: string | null
  next_action: string | null
  description: string | null
}

export async function NextCallWidget({ hubId }: { hubId: string; hubSlug: string; hubColor: string | null }) {
  // Find tasks tagged as calls/discovery (heuristic — searches title/next_action for "call")
  let upcoming: Task[] = []
  try {
    const supabase = createAdminClient()
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('crm_tasks')
      .select('id, title, due_date, next_action, description')
      .eq('hub_id', hubId)
      .neq('status', 'Done')
      .or('title.ilike.%call%,title.ilike.%discovery%,title.ilike.%meeting%,next_action.ilike.%call%')
      .gte('due_date', today)
      .order('due_date', { ascending: true })
      .limit(3)
    upcoming = (data ?? []) as Task[]
  } catch { /* empty */ }

  const next = upcoming[0]
  const daysAway = next?.due_date
    ? Math.ceil((new Date(next.due_date + 'T00:00:00').getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <WidgetShell title="Next Discovery Call">
      {!next ? (
        <WidgetEmpty message="No upcoming calls scheduled" />
      ) : (
        <div>
          <div className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{next.title}</div>
          {daysAway !== null && (
            <div className="text-[24px] font-semibold tracking-tight mt-2" style={{ color: 'var(--text-primary)' }}>
              {daysAway === 0 ? 'Today' : daysAway === 1 ? 'Tomorrow' : `${daysAway} days`}
            </div>
          )}
          {next.next_action && (
            <div className="text-[11px] mt-3" style={{ color: 'var(--text-muted)' }}>
              Prep: {next.next_action}
            </div>
          )}
          {upcoming.length > 1 && (
            <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Also coming up</div>
              {upcoming.slice(1).map(t => (
                <div key={t.id} className="flex items-center gap-3 py-1">
                  <div className="flex-1 text-[12px] truncate" style={{ color: 'var(--text-body)' }}>{t.title}</div>
                  <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{t.due_date}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </WidgetShell>
  )
}
