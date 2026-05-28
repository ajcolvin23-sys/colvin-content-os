import { createAdminClient } from '@/lib/supabase/admin'
import { PageHeader } from '@/components/hermes/PageHeader'
import { EmptyState } from '@/components/hermes/EmptyState'
import { Bot, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { getActiveHubScope, getHubLabel } from '@/lib/crm/hub-scope'

export const dynamic = 'force-dynamic'

async function getAgentLogs(scope: string | null) {
  try {
    const supabase = createAdminClient()
    let query = supabase
      .from('hermes_agent_logs')
      .select(`
        id, agent_name, action_taken, result, error, confidence_level, human_review_required, created_at,
        hub_id,
        hubs!hermes_agent_logs_hub_id_fkey (id, name, slug)
      `)
      .order('created_at', { ascending: false })
      .limit(200)
    if (scope) query = query.eq('hub_id', scope)
    const { data, error } = await query
    if (error) return []
    return data ?? []
  } catch {
    return []
  }
}

export default async function AgentLogsPage() {
  const scope = await getActiveHubScope()
  const scopeLabel = await getHubLabel(scope)
  const logs = await getAgentLogs(scope) as Record<string, unknown>[]

  const reviewCount = logs.filter(l => l.human_review_required).length
  const errorCount = logs.filter(l => l.error).length

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Agent Logs"
        subtitle={`${scope ? `${scopeLabel} · ` : ''}${logs.length} logged actions · ${reviewCount} need review${errorCount > 0 ? ` · ${errorCount} with errors` : ''}`}
      />

      {logs.length === 0 ? (
        <EmptyState
          icon={Bot}
          title="No agent logs yet"
          description="Agent logs will appear here as Gabriel and Hermes agents take actions. All agent activity is logged for review."
        />
      ) : (
        <div className="space-y-2">
          {logs.map(log => {
            const hub = log.hubs as Record<string, unknown> | null
            const needsReview = log.human_review_required as boolean
            const hasError = Boolean(log.error)

            return (
              <div
                key={log.id as string}
                className={`bg-slate-900 border rounded-xl p-4 transition-colors ${
                  hasError ? 'border-red-500/30 bg-red-500/5' :
                  needsReview ? 'border-amber-500/30 bg-amber-500/5' :
                  'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex-shrink-0 ${hasError ? 'text-red-400' : needsReview ? 'text-amber-400' : 'text-slate-600'}`}>
                    {hasError ? <AlertTriangle className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {Boolean(log.agent_name) && (
                        <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                          {log.agent_name as string}
                        </span>
                      )}
                      {needsReview && (
                        <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">Review Required</span>
                      )}
                      {Boolean(log.confidence_level) && (
                        <span className="text-xs text-slate-600">{log.confidence_level as string} confidence</span>
                      )}
                      <span className="text-xs text-slate-700 ml-auto">
                        {new Date(log.created_at as string).toLocaleString('en-US', {
                          month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {Boolean(log.action_taken) && (
                      <p className="text-sm text-slate-300 leading-snug mb-1">{log.action_taken as string}</p>
                    )}

                    {hub && (
                      <Link href={`/hubs/${String(hub.slug)}`} className="text-xs text-slate-500 hover:text-indigo-400 transition-colors">
                        {hub.name as string}
                      </Link>
                    )}

                    {Boolean(log.result) && (
                      <div className="mt-2 text-xs text-slate-400 bg-slate-800/50 rounded px-3 py-2 line-clamp-2">
                        {log.result as string}
                      </div>
                    )}

                    {hasError && (
                      <div className="mt-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
                        {log.error as string}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
