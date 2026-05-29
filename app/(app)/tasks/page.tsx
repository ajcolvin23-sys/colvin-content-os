import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { getActiveHubScope, getHubLabel } from '@/lib/crm/hub-scope'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ filter?: string; status?: string; priority?: string; hub?: string }>
}

async function getTasks(scope: string | null) {
  try {
    const supabase = createAdminClient()
    let query = supabase
      .from('crm_tasks')
      .select(`
        id, title, description, status, priority, due_date, assigned_to, next_action, created_at,
        hub_id,
        hubs!crm_tasks_hub_id_fkey (id, name, slug, color)
      `)
      .order('priority')
      .order('due_date', { ascending: true, nullsFirst: false })
      .limit(300)
    if (scope) query = query.eq('hub_id', scope)
    const { data, error } = await query
    if (error) return []
    return data ?? []
  } catch {
    return []
  }
}

export default async function TasksPage({ searchParams }: PageProps) {
  const { filter, status, priority } = await searchParams
  const scope = await getActiveHubScope()
  const scopeLabel = await getHubLabel(scope)
  const allTasks = await getTasks(scope)
  const today = new Date().toISOString().split('T')[0]

  let tasks = allTasks as Record<string, unknown>[]
  if (filter === 'overdue') tasks = tasks.filter(t => t.due_date && (t.due_date as string) < today && t.status !== 'Done')
  if (status) tasks = tasks.filter(t => t.status === status)
  if (priority) tasks = tasks.filter(t => t.priority === priority)

  const openCount = allTasks.filter(t => (t as Record<string, unknown>).status !== 'Done').length
  const overdueCount = allTasks.filter(t => {
    const tt = t as Record<string, unknown>
    return tt.due_date && (tt.due_date as string) < today && tt.status !== 'Done'
  }).length

  const filterOptions = [
    { href: '/tasks', label: 'All' },
    { href: '/tasks?filter=overdue', label: `Overdue${overdueCount > 0 ? ` · ${overdueCount}` : ''}` },
    { href: '/tasks?priority=Critical', label: 'Critical' },
    { href: '/tasks?priority=High', label: 'High' },
    { href: '/tasks?status=In Progress', label: 'In progress' },
    { href: '/tasks?status=Blocked', label: 'Blocked' },
  ]

  return (
    <div className="min-h-screen">
      <div className="px-10 pt-10 pb-6">
        <div className="max-w-5xl">
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Tasks</h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--text-body)' }}>
            {scope ? `${scopeLabel} · ` : ''}{openCount} open{overdueCount > 0 ? ` · ${overdueCount} overdue` : ''}
          </p>

          <div className="flex gap-1 mt-5 flex-wrap">
            {filterOptions.map(f => (
              <Link key={f.href} href={f.href} className="text-[12px] px-2.5 py-1 rounded transition-colors"
                style={{ color: 'var(--text-body)', background: 'var(--bg-panel)' }}>
                {f.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="px-10 pb-12">
        <div className="max-w-5xl">
          {tasks.length === 0 ? (
            <div className="py-12 text-center text-[13px]" style={{ color: 'var(--text-dim)' }}>
              No tasks{filter ? ' matching this filter' : ' yet'}
            </div>
          ) : (
            <div className="rounded" style={{ background: 'var(--bg-panel)' }}>
              {tasks.map(task => {
                const hub = task.hubs as Record<string, unknown> | null
                const isOverdue = task.due_date && (task.due_date as string) < today && task.status !== 'Done'
                return (
                  <div key={task.id as string} className="flex items-center gap-4 px-5 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    {hub && (
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: (hub.color as string) ?? '#6b6b6b' }} />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] truncate" style={{ color: 'var(--text-primary)' }}>{task.title as string}</div>
                      {Boolean(task.next_action) && (
                        <div className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                          {task.next_action as string}
                        </div>
                      )}
                    </div>
                    {hub && (
                      <Link href={`/h/${hub.slug as string}`} className="text-[11px] hidden md:block" style={{ color: 'var(--text-muted)' }}>
                        {hub.name as string}
                      </Link>
                    )}
                    <span className="text-[11px] w-20" style={{ color: 'var(--text-muted)' }}>{task.priority as string}</span>
                    <span className="text-[11px] w-24" style={{ color: isOverdue ? 'var(--state-danger)' : 'var(--text-muted)' }}>
                      {task.due_date ? new Date((task.due_date as string) + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
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
