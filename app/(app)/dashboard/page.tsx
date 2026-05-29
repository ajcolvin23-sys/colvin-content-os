import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { getActiveHubScope, getHubLabel } from '@/lib/crm/hub-scope'

export const dynamic = 'force-dynamic'

interface Hub { id: string; name: string; slug: string; status: string; priority: string; next_action: string | null; color: string | null }
interface Task { id: string; title: string; status: string; priority: string; due_date: string | null; hub_id: string | null }
interface Lead { id: string; business_name: string | null; contact_name: string | null; status: string; next_follow_up_date: string | null; hub_id: string | null }
interface Opp { id: string; title: string; amount: number; stage: string; probability: number; hub_id: string | null }
interface Approval { id: string; title: string | null; risk_level: string; status: string; item_type: string | null; created_at: string }
interface AgentLog { id: string; agent_name: string | null; action_taken: string | null; human_review_required: boolean; confidence_level: string | null; created_at: string }

async function getDashboardData(scope: string | null) {
  const supabase = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  const taskQuery = scope
    ? supabase.from('crm_tasks').select('id, title, status, priority, due_date, hub_id').eq('hub_id', scope).neq('status', 'Done').limit(100)
    : supabase.from('crm_tasks').select('id, title, status, priority, due_date, hub_id').neq('status', 'Done').limit(100)
  const leadQuery = scope
    ? supabase.from('leads').select('id, business_name, contact_name, status, next_follow_up_date, hub_id').eq('hub_id', scope).limit(200)
    : supabase.from('leads').select('id, business_name, contact_name, status, next_follow_up_date, hub_id').limit(200)
  const revenueQuery = scope
    ? supabase.from('revenue_opportunities').select('id, title, amount, stage, probability, hub_id').eq('hub_id', scope).neq('stage', 'Won').neq('stage', 'Lost')
    : supabase.from('revenue_opportunities').select('id, title, amount, stage, probability, hub_id').neq('stage', 'Won').neq('stage', 'Lost')
  const approvalQuery = scope
    ? supabase.from('hermes_approvals').select('id, title, risk_level, status, item_type, created_at').eq('hub_id', scope).eq('status', 'Pending').limit(10)
    : supabase.from('hermes_approvals').select('id, title, risk_level, status, item_type, created_at').eq('status', 'Pending').limit(10)
  const agentQuery = scope
    ? supabase.from('hermes_agent_logs').select('id, agent_name, action_taken, human_review_required, confidence_level, created_at').eq('hub_id', scope).order('created_at', { ascending: false }).limit(5)
    : supabase.from('hermes_agent_logs').select('id, agent_name, action_taken, human_review_required, confidence_level, created_at').order('created_at', { ascending: false }).limit(5)

  const [hubs, tasks, leads, revenue, approvals, agentLogs] = await Promise.allSettled([
    supabase.from('hubs').select('id, name, slug, status, priority, next_action, color').order('priority'),
    taskQuery, leadQuery, revenueQuery, approvalQuery, agentQuery,
  ])

  const allHubs = (hubs.status === 'fulfilled' ? hubs.value.data : []) as Hub[]
  const allTasks = (tasks.status === 'fulfilled' ? tasks.value.data : []) as Task[]
  const allLeads = (leads.status === 'fulfilled' ? leads.value.data : []) as Lead[]
  const allRevenue = (revenue.status === 'fulfilled' ? revenue.value.data : []) as Opp[]
  const allApprovals = (approvals.status === 'fulfilled' ? approvals.value.data : []) as Approval[]
  const allAgentLogs = (agentLogs.status === 'fulfilled' ? agentLogs.value.data : []) as AgentLog[]

  const overdueTasks = allTasks.filter(t => t.due_date && t.due_date < today)
  const activeHubs = allHubs.filter(h => ['Active', 'Revenue Focus', 'Building'].includes(h.status))
  const followupsDue = allLeads.filter(l => l.next_follow_up_date && l.next_follow_up_date <= today)
  const pipelineTotal = allRevenue.reduce((s, r) => s + (r.amount ?? 0), 0)
  const weightedTotal = allRevenue.reduce((s, r) => s + ((r.amount ?? 0) * (r.probability ?? 0) / 100), 0)

  const pOrder: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3, Future: 4 }
  const topTasks = [...allTasks].sort((a, b) => (pOrder[a.priority] ?? 5) - (pOrder[b.priority] ?? 5)).slice(0, 6)
  const topRevenue = [...allRevenue].sort((a, b) => (b.amount ?? 0) * (b.probability ?? 0) - (a.amount ?? 0) * (a.probability ?? 0)).slice(0, 5)
  const criticalHubs = activeHubs.filter(h => h.priority === 'Critical').slice(0, 6)

  return {
    activeHubCount: activeHubs.length,
    openTaskCount: allTasks.length,
    overdueTaskCount: overdueTasks.length,
    activeLeadCount: allLeads.filter(l => !['Won', 'Lost'].includes(l.status)).length,
    followupsDueCount: followupsDue.length,
    pipelineTotal,
    weightedTotal,
    pendingApprovalCount: allApprovals.length,
    topTasks, topRevenue, allApprovals, allAgentLogs, criticalHubs,
    topFollowups: followupsDue.slice(0, 5),
    hubMap: new Map(allHubs.map(h => [h.id, h])),
  }
}

export default async function DashboardPage() {
  const scope = await getActiveHubScope()
  const data = await getDashboardData(scope)
  const scopeLabel = await getHubLabel(scope)
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen">
      <div className="px-10 pt-10 pb-6">
        <div className="max-w-5xl">
          <div className="text-[11px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>{today}</div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {scope ? scopeLabel : 'Command Center'}
          </h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--text-body)' }}>
            {scope ? 'Scoped view — pick All hubs to widen' : 'Across all 20 hubs'}
          </p>
        </div>
      </div>

      <div className="px-10 pb-12">
        <div className="max-w-5xl">

          {/* Stat row — minimal, no boxes */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-5 pb-8 mb-8" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <Stat label="Active hubs" value={data.activeHubCount} href="/hubs" />
            <Stat label="Open tasks" value={data.openTaskCount} href="/tasks" />
            <Stat label="Overdue" value={data.overdueTaskCount} alert href="/tasks" />
            <Stat label="Active leads" value={data.activeLeadCount} href="/leads" />
            <Stat label="Follow-ups due" value={data.followupsDueCount} alert href="/leads" />
            <Stat label="Pending review" value={data.pendingApprovalCount} alert href="/approvals" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Today's Priorities */}
            <Panel title="Today's Priorities" link={{ label: 'All tasks', href: '/tasks' }}>
              {data.topTasks.length === 0 ? (
                <Empty message="No open tasks" />
              ) : (
                <div>
                  {data.topTasks.map(task => {
                    const overdue = task.due_date && task.due_date < todayStr
                    return (
                      <Row key={task.id} primary={task.title}
                        secondary={data.hubMap.get(task.hub_id ?? '')?.name}
                        meta={task.due_date ? new Date(task.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : task.priority}
                        metaColor={overdue ? 'var(--state-danger)' : 'var(--text-muted)'}
                      />
                    )
                  })}
                </div>
              )}
            </Panel>

            {/* Revenue Pipeline */}
            <Panel title="Pipeline" link={{ label: 'All revenue', href: '/revenue' }}>
              <div className="grid grid-cols-2 gap-6 pb-4 mb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Total</div>
                  <div className="text-xl font-semibold tracking-tight mt-1" style={{ color: 'var(--text-primary)' }}>
                    ${data.pipelineTotal.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Weighted</div>
                  <div className="text-xl font-semibold tracking-tight mt-1" style={{ color: 'var(--text-primary)' }}>
                    ${Math.round(data.weightedTotal).toLocaleString()}
                  </div>
                </div>
              </div>
              {data.topRevenue.length === 0 ? <Empty message="No active opportunities" /> : (
                <div>
                  {data.topRevenue.map(opp => (
                    <Row key={opp.id} primary={opp.title} meta={`$${opp.amount?.toLocaleString()}`} secondary={opp.stage} />
                  ))}
                </div>
              )}
            </Panel>

            {/* Critical hubs */}
            <Panel title="Critical Hubs" link={{ label: 'All hubs', href: '/hubs' }}>
              {data.criticalHubs.length === 0 ? <Empty message="No critical hubs flagged" /> : (
                <div>
                  {data.criticalHubs.map(hub => (
                    <Link key={hub.id} href={`/h/${hub.slug}`} className="block">
                      <div className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: hub.color ?? '#6b6b6b' }} />
                        <div className="flex-1 text-[12px] truncate" style={{ color: 'var(--text-primary)' }}>{hub.name}</div>
                        <div className="text-[11px] truncate max-w-[180px]" style={{ color: 'var(--text-muted)' }}>{hub.next_action}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Panel>

            {/* Pending Approvals */}
            <Panel title="Pending Review" link={{ label: 'All approvals', href: '/approvals' }}>
              {data.allApprovals.length === 0 ? <Empty message="Nothing awaiting your approval" /> : (
                <div>
                  {data.allApprovals.map(a => (
                    <Row key={a.id} primary={a.title ?? 'Unnamed'} secondary={a.item_type ?? ''} meta={a.risk_level}
                      metaColor={a.risk_level === 'High' ? 'var(--state-danger)' : a.risk_level === 'Medium' ? 'var(--state-warning)' : 'var(--text-muted)'} />
                  ))}
                </div>
              )}
            </Panel>

          </div>

          {/* Follow-ups callout — only if there are some */}
          {data.topFollowups.length > 0 && (
            <div className="mt-8 px-5 py-4 rounded" style={{ background: 'var(--bg-panel)', borderLeft: '2px solid var(--state-warning)' }}>
              <div className="text-[11px] uppercase tracking-wider mb-2" style={{ color: 'var(--state-warning)' }}>Follow-ups due</div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
                {data.topFollowups.map(lead => (
                  <div key={lead.id} className="flex items-center gap-3 py-1.5">
                    <div className="flex-1 text-[12px] truncate" style={{ color: 'var(--text-primary)' }}>
                      {lead.business_name || lead.contact_name}
                    </div>
                    <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{lead.next_follow_up_date}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, href, alert }: { label: string; value: number; href?: string; alert?: boolean }) {
  const content = (
    <div>
      <div className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{label}</div>
      <div className="text-2xl font-semibold tracking-tight mt-1" style={{ color: alert && value > 0 ? 'var(--state-warning)' : 'var(--text-primary)' }}>
        {value}
      </div>
    </div>
  )
  return href ? <Link href={href}>{content}</Link> : content
}

function Panel({ title, link, children }: { title: string; link?: { label: string; href: string }; children: React.ReactNode }) {
  return (
    <div className="rounded p-5" style={{ background: 'var(--bg-panel)' }}>
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-[13px] font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>{title}</h2>
        {link && (
          <Link href={link.href} className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{link.label} →</Link>
        )}
      </div>
      {children}
    </div>
  )
}

function Row({ primary, secondary, meta, metaColor }: { primary: string; secondary?: string; meta?: string; metaColor?: string }) {
  return (
    <div className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] truncate" style={{ color: 'var(--text-primary)' }}>{primary}</div>
        {secondary && <div className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{secondary}</div>}
      </div>
      {meta && <div className="text-[11px] flex-shrink-0" style={{ color: metaColor ?? 'var(--text-muted)' }}>{meta}</div>}
    </div>
  )
}

function Empty({ message }: { message: string }) {
  return <div className="py-6 text-center text-[12px]" style={{ color: 'var(--text-dim)' }}>{message}</div>
}
