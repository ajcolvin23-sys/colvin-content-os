import type { Hub, CrmTask, ResearchNote, Prompt, CrmAutomation, RevenueOpportunity } from '@/lib/crm/types'
import { StatusBadge } from '@/components/hermes/StatusBadge'
import { PriorityBadge } from '@/components/hermes/PriorityBadge'
import { EvidenceBadge } from '@/components/hermes/EvidenceBadge'
import { HubTabs } from '@/components/hermes/HubTabs'
import { ArrowRight, CheckSquare, Users, BookOpen, Zap, Workflow, DollarSign } from 'lucide-react'
import Link from 'next/link'

interface Props {
  hub: Hub
  tasks: CrmTask[]
  leads: Record<string, unknown>[]
  research: ResearchNote[]
  prompts: Prompt[]
  automations: CrmAutomation[]
  revenue: RevenueOpportunity[]
  activeTab: string
}

export function HubDetail({ hub, tasks, leads, research, prompts, automations, revenue, activeTab }: Props) {
  const openTasks = tasks.filter(t => t.status !== 'Done')
  const pipelineTotal = revenue.reduce((sum, r) => sum + (r.amount ?? 0), 0)
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hub Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Link href="/hubs" className="text-xs text-slate-500 hover:text-slate-400">Hubs</Link>
          <span className="text-slate-700">/</span>
          <span className="text-xs text-slate-400">{hub.name}</span>
        </div>
        <div className="flex items-start gap-4 mt-3">
          <div
            className="w-3 h-12 rounded-full flex-shrink-0 mt-1"
            style={{ backgroundColor: hub.color ?? '#6366f1' }}
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-white">{hub.name}</h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <StatusBadge status={hub.status} />
              <PriorityBadge priority={hub.priority} />
              {Boolean(hub.category) && (
                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{hub.category}</span>
              )}
            </div>
            {Boolean(hub.description) && (
              <p className="text-sm text-slate-400 mt-2 leading-relaxed max-w-2xl">{hub.description}</p>
            )}
          </div>
        </div>

        {Boolean(hub.next_action) && (
          <div className="flex items-center gap-2 mt-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl px-4 py-3">
            <ArrowRight className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span className="text-sm text-slate-300 font-medium">Next: </span>
            <span className="text-sm text-slate-400">{hub.next_action}</span>
          </div>
        )}

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          {[
            { icon: CheckSquare, value: openTasks.length, label: 'Open Tasks', color: 'text-blue-400' },
            { icon: Users, value: leads.length, label: 'Leads', color: 'text-emerald-400' },
            { icon: DollarSign, value: `$${pipelineTotal.toLocaleString()}`, label: 'Pipeline', color: 'text-emerald-400' },
            { icon: BookOpen, value: research.length, label: 'Research Notes', color: 'text-violet-400' },
          ].map(({ icon: Icon, value, label, color }) => (
            <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
              <div className={`text-lg font-bold ${color}`}>{value}</div>
              <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <Icon className="w-3 h-3" />
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <HubTabs />

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent tasks */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Open Tasks</h3>
              <span className="text-xs text-slate-500">{openTasks.length} tasks</span>
            </div>
            {openTasks.length === 0 ? (
              <p className="text-xs text-slate-600 py-4 text-center">No open tasks</p>
            ) : (
              <div className="space-y-2">
                {openTasks.slice(0, 5).map(task => (
                  <div key={task.id} className="flex items-center gap-2 py-1.5 border-b border-slate-800/50 last:border-0">
                    <PriorityBadge priority={task.priority} />
                    <span className="text-sm text-slate-300 flex-1 line-clamp-1">{task.title}</span>
                    {task.due_date && (
                      <span className={`text-xs ${task.due_date < today ? 'text-red-400' : 'text-slate-600'}`}>
                        {task.due_date}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Revenue */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Revenue Pipeline</h3>
              {Boolean(hub.revenue_potential) && (
                <span className="text-xs text-slate-500">{hub.revenue_potential}</span>
              )}
            </div>
            {revenue.length === 0 ? (
              <p className="text-xs text-slate-600 py-4 text-center">No revenue opportunities</p>
            ) : (
              <div className="space-y-2">
                {revenue.map(opp => (
                  <div key={opp.id} className="flex items-center gap-2 py-1.5 border-b border-slate-800/50 last:border-0">
                    <StatusBadge status={opp.stage} />
                    <span className="text-sm text-slate-300 flex-1 line-clamp-1">{opp.title}</span>
                    <span className="text-sm font-medium text-emerald-400">${opp.amount?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent research */}
          {research.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:col-span-2">
              <h3 className="text-sm font-semibold text-white mb-4">Recent Research</h3>
              <div className="space-y-3">
                {research.slice(0, 3).map(note => (
                  <div key={note.id} className="border-b border-slate-800/50 last:border-0 pb-3 last:pb-0">
                    <div className="flex items-start gap-2 mb-1">
                      <EvidenceBadge quality={note.evidence_quality} />
                      <span className="text-sm font-medium text-slate-200">{note.title}</span>
                    </div>
                    {Boolean(note.summary) && (
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mt-1">{note.summary}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {tasks.length === 0 ? (
            <div className="p-8 text-center text-slate-600 text-sm">No tasks for this hub</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Task</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Due</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.id} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="text-sm text-slate-200">{task.title}</div>
                      {Boolean(task.next_action) && <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{task.next_action}</div>}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={task.status} /></td>
                    <td className="px-4 py-3"><PriorityBadge priority={task.priority} /></td>
                    <td className="px-4 py-3">
                      {task.due_date ? (
                        <span className={`text-xs ${task.due_date < today ? 'text-red-400' : 'text-slate-500'}`}>
                          {task.due_date}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-700">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'leads' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {leads.length === 0 ? (
            <div className="p-8 text-center text-slate-600 text-sm">No leads for this hub</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Lead</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Score</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead.id as string} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="text-sm text-slate-200">{(lead.name as string) || (lead.company as string) || '—'}</div>
                      {Boolean(lead.company) && Boolean(lead.name) && <div className="text-xs text-slate-500">{lead.company as string}</div>}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={(lead.status as string) ?? 'New'} /></td>
                    <td className="px-4 py-3">
                      {lead.qualification_score ? (
                        <span className="text-xs font-bold text-emerald-400">{lead.qualification_score as number}/10</span>
                      ) : (
                        <span className="text-xs text-slate-700">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'research' && (
        <div className="space-y-3">
          {research.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-600 text-sm">No research notes for this hub</div>
          ) : (
            research.map(note => (
              <div key={note.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex items-start gap-3 mb-2">
                  <EvidenceBadge quality={note.evidence_quality} />
                  <h3 className="text-sm font-semibold text-white flex-1">{note.title}</h3>
                </div>
                {Boolean(note.source) && <div className="text-xs text-slate-500 mb-2">Source: {note.source}</div>}
                {Boolean(note.summary) && <p className="text-sm text-slate-400 leading-relaxed mb-3">{note.summary}</p>}
                {Boolean(note.action_items) && (
                  <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-lg px-3 py-2 text-xs text-slate-400">
                    <span className="text-indigo-400 font-medium">Action: </span>{note.action_items}
                  </div>
                )}
                {note.tags && note.tags.length > 0 && (
                  <div className="flex gap-1 mt-3 flex-wrap">
                    {note.tags.map(tag => (
                      <span key={tag} className="text-[10px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'prompts' && (
        <div className="space-y-3">
          {prompts.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-600 text-sm">No prompts for this hub</div>
          ) : (
            prompts.map(prompt => (
              <div key={prompt.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{prompt.title}</h3>
                    <div className="flex gap-2 mt-1">
                      {Boolean(prompt.category) && <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded">{prompt.category}</span>}
                      {Boolean(prompt.model_target) && <span className="text-xs text-slate-600">{prompt.model_target}</span>}
                    </div>
                  </div>
                  <StatusBadge status={prompt.status} />
                </div>
                {Boolean(prompt.use_case) && <div className="text-xs text-slate-500 mb-3">Use case: {prompt.use_case}</div>}
                {Boolean(prompt.prompt_text) && (
                  <div className="bg-slate-800/50 rounded-lg p-3 text-xs text-slate-400 font-mono leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {prompt.prompt_text}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'automations' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {automations.length === 0 ? (
            <div className="p-8 text-center text-slate-600 text-sm">No automations for this hub</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Automation</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Trigger</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tools</th>
                </tr>
              </thead>
              <tbody>
                {automations.map(auto => (
                  <tr key={auto.id} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="text-sm text-slate-200">{auto.name}</div>
                      {Boolean(auto.workflow_description) && (
                        <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{auto.workflow_description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-500">{auto.trigger_type ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={auto.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {auto.tools_required?.slice(0, 3).map(tool => (
                          <span key={tool} className="text-[10px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">{tool}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'revenue' && (
        <div className="space-y-3">
          {revenue.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-600 text-sm">No revenue opportunities for this hub</div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <div className="text-xs text-slate-500 mb-1">Total Pipeline</div>
                  <div className="text-xl font-bold text-white">${pipelineTotal.toLocaleString()}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <div className="text-xs text-slate-500 mb-1">Weighted Value</div>
                  <div className="text-xl font-bold text-emerald-400">
                    ${Math.round(revenue.reduce((s, r) => s + (r.amount ?? 0) * ((r.probability ?? 0) / 100), 0)).toLocaleString()}
                  </div>
                </div>
              </div>
              {revenue.map(opp => (
                <div key={opp.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="text-sm font-semibold text-white">{opp.title}</h3>
                      <div className="flex gap-2 mt-1">
                        <StatusBadge status={opp.stage} />
                        <span className="text-xs text-slate-500">{opp.probability}% probability</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-emerald-400">${opp.amount?.toLocaleString()}</div>
                      {Boolean(opp.close_date) && <div className="text-xs text-slate-500">{opp.close_date}</div>}
                    </div>
                  </div>
                  {Boolean(opp.notes) && <p className="text-xs text-slate-500 mt-2">{opp.notes}</p>}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
