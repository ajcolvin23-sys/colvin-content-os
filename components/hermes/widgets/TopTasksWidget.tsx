import { createAdminClient } from '@/lib/supabase/admin'
import { WidgetShell, WidgetEmpty } from './WidgetShell'

interface Task { id: string; title: string; priority: string; due_date: string | null; status: string }

export async function TopTasksWidget({ hubId }: { hubId: string; hubSlug: string; hubColor: string | null }) {
  let tasks: Task[] = []
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('crm_tasks')
      .select('id, title, priority, due_date, status')
      .eq('hub_id', hubId)
      .neq('status', 'Done')
      .order('priority')
      .order('due_date', { ascending: true, nullsFirst: false })
      .limit(6)
    tasks = (data ?? []) as Task[]
  } catch { /* empty */ }

  const today = new Date().toISOString().split('T')[0]

  return (
    <WidgetShell title="Open Tasks" meta={tasks.length > 0 ? `${tasks.length}` : undefined}>
      {tasks.length === 0 ? (
        <WidgetEmpty message="No open tasks" />
      ) : (
        <div>
          {tasks.map(t => {
            const overdue = t.due_date && t.due_date < today
            return (
              <div key={t.id} className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="flex-1 text-[12px] truncate" style={{ color: 'var(--text-primary)' }}>
                  {t.title}
                </div>
                <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{t.priority}</div>
                {t.due_date && (
                  <div className="text-[11px]" style={{ color: overdue ? 'var(--state-danger)' : 'var(--text-muted)' }}>
                    {new Date(t.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </WidgetShell>
  )
}
