import { createAdminClient } from '@/lib/supabase/admin'
import { PageHeader } from '@/components/hermes/PageHeader'
import { StatusBadge } from '@/components/hermes/StatusBadge'
import { PriorityBadge } from '@/components/hermes/PriorityBadge'
import { EmptyState } from '@/components/hermes/EmptyState'
import { CheckSquare } from 'lucide-react'
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
  if (filter === 'overdue') {
    tasks = tasks.filter(t => t.due_date && (t.due_date as string) < today && t.status !== 'Done')
  }
  if (status) tasks = tasks.filter(t => t.status === status)
  if (priority) tasks = tasks.filter(t => t.priority === priority)

  const openCount = allTasks.filter(t => (t as Record<string, unknown>).status !== 'Done').length
  const overdueCount = allTasks.filter(t => {
    const tt = t as Record<string, unknown>
    return tt.due_date && (tt.due_date as string) < today && tt.status !== 'Done'
  }).length

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Tasks"
        subtitle={`${scope ? `${scopeLabel} · ` : ''}${openCount} open · ${overdueCount > 0 ? `${overdueCount} overdue` : 'no overdue'}`}
      />

      {/* Quick filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { href: '/tasks', label: 'All Open' },
          { href: '/tasks?filter=overdue', label: `Overdue (${overdueCount})` },
          { href: '/tasks?priority=Critical', label: 'Critical' },
          { href: '/tasks?priority=High', label: 'High' },
          { href: '/tasks?status=In Progress', label: 'In Progress' },
          { href: '/tasks?status=Blocked', label: 'Blocked' },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors bg-slate-900"
          >
            {label}
          </Link>
        ))}
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks found"
          description="Tasks will appear here after seeding the database or creating new tasks."
        />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Task</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Hub</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Due</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => {
                const hub = task.hubs as Record<string, unknown> | null
                const isOverdue = task.due_date && (task.due_date as string) < today && task.status !== 'Done'
                return (
                  <tr key={task.id as string} className={`border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-colors ${isOverdue ? 'bg-red-500/5' : ''}`}>
                    <td className="px-5 py-3.5">
                      <div className="text-sm text-slate-200 leading-snug">{task.title as string}</div>
                      {Boolean(task.next_action) && (
                        <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{task.next_action as string}</div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      {hub ? (
                        <Link
                          href={`/hubs/${hub.slug}`}
                          className="text-xs text-slate-400 hover:text-indigo-400 transition-colors"
                          style={{ color: (hub.color as string) ?? undefined }}
                        >
                          {hub.name as string}
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-700">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5"><StatusBadge status={task.status as string} /></td>
                    <td className="px-4 py-3.5"><PriorityBadge priority={task.priority as string} /></td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      {task.due_date ? (
                        <span className={`text-xs ${isOverdue ? 'text-red-400 font-medium' : 'text-slate-500'}`}>
                          {task.due_date as string}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-700">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
