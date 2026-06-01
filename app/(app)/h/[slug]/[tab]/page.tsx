import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getHubSidebar } from '@/lib/crm/hub-config'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string; tab: string }>
}

interface Hub {
  id: string
  name: string
  slug: string
  status: string
  priority: string
  color: string | null
  next_action: string | null
}

interface Task {
  id: string
  title: string
  status: string
  priority: string
  due_date: string | null
}

async function getHub(slug: string): Promise<Hub | null> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('hubs')
      .select('id, name, slug, status, priority, color, next_action')
      .eq('slug', slug)
      .maybeSingle()
    if (error) return null
    return (data as Hub | null) ?? null
  } catch {
    return null
  }
}

async function getHubTasks(hubId: string): Promise<Task[]> {
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('crm_tasks')
      .select('id, title, status, priority, due_date')
      .eq('hub_id', hubId)
      .neq('status', 'Done')
      .limit(50)
    return (data ?? []) as Task[]
  } catch {
    return []
  }
}

function titleCase(segment: string): string {
  return segment
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export default async function HubTabPage({ params }: PageProps) {
  const { slug, tab } = await params
  const hub = await getHub(slug)
  if (!hub) notFound()

  // Resolve the friendly tab label from the hub's configured sidebar.
  const sidebar = getHubSidebar(slug)
  const navItem = sidebar.find(item => item.href === `/h/${slug}/${tab}`)
  const tabLabel = navItem?.label ?? titleCase(tab)

  const tasks = await getHubTasks(hub.id)
  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-10 pt-10 pb-6" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="max-w-5xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full" style={{ background: hub.color ?? '#6b6b6b' }} />
            <Link href={`/h/${hub.slug}`} className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              {hub.name}
            </Link>
            <span style={{ color: 'var(--text-dim)' }}>/</span>
            <span className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--text-body)' }}>{tabLabel}</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {tabLabel}
          </h1>
        </div>
      </div>

      {/* Tab sub-nav */}
      <div className="px-10 pt-5">
        <div className="max-w-5xl flex flex-wrap gap-x-5 gap-y-2">
          {sidebar.map(item => {
            const active = item.href === `/h/${slug}/${tab}`
            return (
              <Link
                key={item.href}
                href={item.href}
                className="text-[12px] pb-1"
                style={{
                  color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                  borderBottom: active ? `2px solid ${hub.color ?? 'var(--accent)'}` : '2px solid transparent',
                }}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-10 py-8">
        <div className="max-w-5xl">
          <div className="rounded p-5" style={{ background: 'var(--bg-panel)' }}>
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-[13px] font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {tabLabel} — open work
              </h2>
              <Link href="/tasks" className="text-[11px]" style={{ color: 'var(--text-muted)' }}>All tasks →</Link>
            </div>
            {tasks.length === 0 ? (
              <div className="py-8 text-center">
                <div className="text-[13px]" style={{ color: 'var(--text-body)' }}>
                  Nothing here yet for {hub.name}.
                </div>
                <div className="text-[12px] mt-1" style={{ color: 'var(--text-dim)' }}>
                  This is the <span style={{ color: 'var(--text-muted)' }}>{tabLabel}</span> view. Tasks tagged to this hub will show up here.
                </div>
              </div>
            ) : (
              <div>
                {tasks.map(task => {
                  const overdue = task.due_date && task.due_date < todayStr
                  return (
                    <div key={task.id} className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] truncate" style={{ color: 'var(--text-primary)' }}>{task.title}</div>
                        <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{task.status}</div>
                      </div>
                      <div className="text-[11px] flex-shrink-0" style={{ color: overdue ? 'var(--state-danger)' : 'var(--text-muted)' }}>
                        {task.due_date
                          ? new Date(task.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          : task.priority}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
