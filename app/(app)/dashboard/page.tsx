import { createAdminClient } from '@/lib/supabase/admin'
import { MetricCard } from '@/components/hermes/MetricCard'
import { StatusBadge } from '@/components/hermes/StatusBadge'
import { PriorityBadge } from '@/components/hermes/PriorityBadge'
import { LayoutGrid, CheckSquare, AlertCircle, Users, Clock, DollarSign, ShieldCheck, Bot } from 'lucide-react'
import Link from 'next/link'
import { getActiveHubScope, getHubLabel } from '@/lib/crm/hub-scope'

export const dynamic = 'force-dynamic'

async function getDashboardData(scope: string | null) {
  const supabase = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  // Scoped queries — when a hub is selected, filter every entity to that hub.
  // The hubs list is never scoped (we always want the full sidebar context).
  const scopedTaskQuery = scope
    ? supabase.from('crm_tasks').select('id, title, status, priority, due_date, hub_id').neq('status', 'Done').eq('hub_id', scope).limit(100)
    : supabase.from('crm_tasks').select('id, title, status, priority, due_date, hub_id').neq('status', 'Done').limit(100)

  const scopedLeadsQuery = scope
    ? supabase.from('leads').select('id, business_name, contact_name, status, next_follow_up_date, hub_id').eq('hub_id', scope).limit(200)
    : supabase.from('leads').select('id, business_name, contact_name, status, next_follow_up_date, hub_id').limit(200)

  const scopedRevenueQuery = scope
    ? supabase.from('revenue_opportunities').select('id, title, amount, stage, probability, hub_id').neq('stage', 'Won').neq('stage', 'Lost').eq('hub_id', scope)
    : supabase.from('revenue_opportunities').select('id, title, amount, stage, probability, hub_id').neq('stage', 'Won').neq('stage', 'Lost')

  const scopedApprovalsQuery = scope
    ? supabase.from('hermes_approvals').select('id, title, risk_level, status, item_type, created_at').eq('status', 'Pending').eq('hub_id', scope).limit(10)
    : supabase.from('hermes_approvals').select('id, title, risk_level, status, item_type, created_at').eq('status', 'Pending').limit(10)

  const scopedAgentLogsQuery = scope
    ? supabase.from('hermes_agent_logs').select('id, agent_name, action_taken, human_review_required, confidence_level, created_at').eq('hub_id', scope).order('created_at', { ascending: false }).limit(5)
    : supabase.from('hermes_agent_logs').select('id, agent_name, action_taken, human_review_required, confidence_level, created_at').order('created_at', { ascending: false }).limit(5)

  const [hubs, tasks, leads, revenue, approvals, agentLogs] = await Promise.allSettled([
    supabase.from('hubs').select('id, name, slug, status, priority, next_action, color').order('priority'),
    scopedTaskQuery,
    scopedLeadsQuery,
    scopedRevenueQuery,
    scopedApprovalsQuery,
    scopedAgentLogsQuery,
  ])

  const allHubs = hubs.status === 'fulfilled' ? (hubs.value.data ?? []) : []
  const allTasks = tasks.status === 'fulfilled' ? (tasks.value.data ?? []) : []
  const allLeads = leads.status === 'fulfilled' ? (leads.value.data ?? []) : []
  const allRevenue = revenue.status === 'fulfilled' ? (revenue.value.data ?? []) : []
  const allApprovals = approvals.status === 'fulfilled' ? (approvals.value.data ?? []) : []
  const allAgentLogs = agentLogs.status === 'fulfilled' ? (agentLogs.value.data ?? []) : []

  const overdueTasks = allTasks.filter(t => t.due_date && t.due_date < today && t.status !== 'Done')
  const activeHubs = allHubs.filter(h => ['Active', 'Revenue Focus', 'Building'].includes(h.status))
  const followupsDue = allLeads.filter(l => {
    const f = (l as Record<string, unknown>).next_follow_up_date
    return typeof f === 'string' && f <= today
  })
  const pipelineTotal = allRevenue.reduce((sum, r) => sum + ((r.amount as number) ?? 0), 0)
  const weightedTotal = allRevenue.reduce((sum, r) => sum + (((r.amount as number) ?? 0) * ((r.probability as number) ?? 0) / 100), 0)

  const priorityOrder: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3, Future: 4 }
  const topTasks = [...allTasks]
    .sort((a, b) => (priorityOrder[a.priority] ?? 5) - (priorityOrder[b.priority] ?? 5))
    .slice(0, 6)

  const topRevenue = [...allRevenue]
    .sort((a, b) => ((b.amount as number) ?? 0) * ((b.probability as number) ?? 0) - ((a.amount as number) ?? 0) * ((a.probability as number) ?? 0))
    .slice(0, 5)

  return {
    activeHubCount: activeHubs.length,
    openTaskCount: allTasks.length,
    overdueTaskCount: overdueTasks.length,
    activeLeadCount: allLeads.filter(l => !['Won', 'Lost'].includes((l as Record<string, unknown>).status as string)).length,
    followupsDueCount: followupsDue.length,
    pipelineTotal,
    weightedTotal,
    pendingApprovalCount: allApprovals.length,
    topTasks,
    topRevenue,
    allApprovals,
    allAgentLogs,
    topFollowups: followupsDue.slice(0, 5),
  }
}

export default async function DashboardPage() {
  const scope = await getActiveHubScope()
  const data = await getDashboardData(scope)
  const scopeLabel = await getHubLabel(scope)
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">{today}</div>
        <h1 className="text-2xl font-bold text-white">Command Center</h1>
        <p className="text-sm text-slate-500 mt-1">
          {scope ? <>Scoped to <span className="text-indigo-400 font-medium">{scopeLabel}</span></> : 'Multi-Project Growth Operating System'}
        </p>
      </div>

      {/* Metric Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
        <MetricCard icon={LayoutGrid} value={data.activeHubCount} label="Active Hubs" iconColor="text-indigo-400" href="/hubs" />
        <MetricCard icon={CheckSquare} value={data.openTaskCount} label="Open Tasks" iconColor="text-blue-400" href="/tasks" />
        <MetricCard icon={AlertCircle} value={data.overdueTaskCount} label="Overdue" iconColor="text-red-400" href="/tasks?filter=overdue" alert={data.overdueTaskCount > 0} />
        <MetricCard icon={Users} value={data.activeLeadCount} label="Active Leads" iconColor="text-emerald-400" href="/leads" />
        <MetricCard icon={Clock} value={data.followupsDueCount} label="Follow-ups Due" iconColor="text-amber-400" href="/leads?filter=followup" alert={data.followupsDueCount > 0} />
        <MetricCard icon={ShieldCheck} value={data.pendingApprovalCount} label="Pending Approvals" iconColor="text-orange-400" href="/approvals" alert={data.pendingApprovalCount > 0} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Today's Priorities */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Today&apos;s Priorities</h2>
            <Link href="/tasks" className="text-xs text-indigo-400 hover:text-indigo-300">View all</Link>
          </div>
          {data.topTasks.length === 0 ? (
            <p className="text-xs text-slate-600 py-4 text-center">No open tasks</p>
          ) : (
            <div className="space-y-2">
              {data.topTasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 py-2 border-b border-slate-800/50 last:border-0">
                  <PriorityBadge priority={task.priority} />
                  <span className="text-sm text-slate-300 flex-1 line-clamp-1">{task.title}</span>
                  {task.due_date && (
                    <span className={`text-xs flex-shrink-0 ${task.due_date < todayStr ? 'text-red-400' : 'text-slate-600'}`}>
                      {new Date(task.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Revenue Pipeline */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Revenue Pipeline</h2>
            <Link href="/revenue" className="text-xs text-indigo-400 hover:text-indigo-300">View all</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-xs text-slate-500 mb-1">Total Pipeline</div>
              <div className="text-lg font-bold text-white">${data.pipelineTotal.toLocaleString()}</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-xs text-slate-500 mb-1">Weighted</div>
              <div className="text-lg font-bold text-emerald-400">${Math.round(data.weightedTotal).toLocaleString()}</div>
            </div>
          </div>
          {data.topRevenue.length === 0 ? (
            <p className="text-xs text-slate-600 py-4 text-center">No active opportunities</p>
          ) : (
            <div className="space-y-2">
              {data.topRevenue.map(opp => (
                <div key={opp.id} className="flex items-center gap-3 py-2 border-b border-slate-800/50 last:border-0">
                  <span className="text-sm text-slate-300 flex-1 line-clamp-1">{opp.title}</span>
                  <span className="text-xs text-slate-500">{opp.stage}</span>
                  <span className="text-sm font-medium text-emerald-400">${(opp.amount as number)?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Approvals */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Pending Approvals</h2>
            <Link href="/approvals" className="text-xs text-indigo-400 hover:text-indigo-300">View all</Link>
          </div>
          {data.allApprovals.length === 0 ? (
            <p className="text-xs text-slate-600 py-4 text-center">No pending approvals</p>
          ) : (
            <div className="space-y-2">
              {data.allApprovals.map(item => (
                <div key={item.id} className="flex items-center gap-3 py-2 border-b border-slate-800/50 last:border-0">
                  <StatusBadge status={(item.risk_level as string) ?? 'Medium'} />
                  <span className="text-sm text-slate-300 flex-1 line-clamp-1">{item.title}</span>
                  <span className="text-xs text-slate-600">{item.item_type}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Agent Activity */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Agent Activity</h2>
            <Link href="/agent-logs" className="text-xs text-indigo-400 hover:text-indigo-300">View all</Link>
          </div>
          {data.allAgentLogs.length === 0 ? (
            <p className="text-xs text-slate-600 py-4 text-center">No agent logs yet</p>
          ) : (
            <div className="space-y-2">
              {data.allAgentLogs.map(log => (
                <div key={log.id} className="flex items-center gap-3 py-2 border-b border-slate-800/50 last:border-0">
                  <Bot className={`w-4 h-4 flex-shrink-0 ${log.human_review_required ? 'text-amber-400' : 'text-slate-600'}`} />
                  <span className="text-sm text-slate-300 flex-1 line-clamp-1">{log.action_taken}</span>
                  <span className="text-xs text-slate-600">{log.agent_name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Revenue note when no pipeline data */}
      {data.topRevenue.length === 0 && data.openTaskCount === 0 && (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 text-center">
          <DollarSign className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-400 mb-1">No data yet</p>
          <p className="text-xs text-slate-600 mb-4">Seed the database to populate your Command Center with all 20 hubs, 40 tasks, and 5 revenue opportunities.</p>
          <a
            href="/api/hermes/seed"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-colors font-medium"
            onClick={e => {
              e.preventDefault()
              fetch('/api/hermes/seed', { method: 'POST' })
                .then(r => r.json())
                .then(d => alert(JSON.stringify(d, null, 2)))
                .then(() => window.location.reload())
            }}
          >
            Seed Database
          </a>
        </div>
      )}

      {/* Follow-ups Row */}
      {data.topFollowups.length > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-amber-400">Follow-ups Due</h2>
            <Link href="/leads?filter=followup" className="text-xs text-amber-400/70 hover:text-amber-400">View all</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {data.topFollowups.map(lead => {
              const l = lead as Record<string, unknown>
              return (
                <div key={lead.id} className="flex items-center gap-3 bg-slate-900 rounded-lg px-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-200 line-clamp-1">
                      {(l.business_name as string) || (l.contact_name as string) || 'Lead'}
                    </div>
                    <div className="text-xs text-amber-400/70">{l.next_follow_up_date as string}</div>
                  </div>
                  <StatusBadge status={(l.status as string) ?? 'New'} />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
