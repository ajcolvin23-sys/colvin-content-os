import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { getActiveHubScope, getHubLabel } from '@/lib/crm/hub-scope'

export const dynamic = 'force-dynamic'

async function getAgentLogs(scope: string | null) {
  try {
    const supabase = createAdminClient()
    let query = supabase
      .from('hermes_agent_logs')
      .select(`id, agent_name, action_taken, result, error, confidence_level, human_review_required, created_at, hub_id,
        hubs!hermes_agent_logs_hub_id_fkey (id, name, slug)`)
      .order('created_at', { ascending: false })
      .limit(200)
    if (scope) query = query.eq('hub_id', scope)
    const { data, error } = await query
    if (error) return []
    return data ?? []
  } catch { return [] }
}

export default async function AgentLogsPage() {
  const scope = await getActiveHubScope()
  const scopeLabel = await getHubLabel(scope)
  const logs = await getAgentLogs(scope) as Record<string, unknown>[]

  const reviewCount = logs.filter(l => l.human_review_required).length
  const errorCount = logs.filter(l => l.error).length

  return (
    <div className="min-h-screen">
      <div className="px-10 pt-10 pb-6">
        <div className="max-w-5xl">
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Agent Logs</h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--text-body)' }}>
            {scope ? `${scopeLabel} · ` : ''}{logs.length} actions
            {reviewCount > 0 && <> · <span style={{ color: 'var(--state-warning)' }}>{reviewCount} need review</span></>}
            {errorCount > 0 && <> · <span style={{ color: 'var(--state-danger)' }}>{errorCount} with errors</span></>}
          </p>
        </div>
      </div>

      <div className="px-10 pb-12">
        <div className="max-w-5xl">
          {logs.length === 0 ? (
            <div className="py-12 text-center text-[13px]" style={{ color: 'var(--text-dim)' }}>
              No agent logs yet — they\&apos;ll appear here as Gabriel and Hermes take actions
            </div>
          ) : (
            <div className="space-y-1">
              {logs.map(log => {
                const hub = log.hubs as Record<string, unknown> | null
                const needsReview = Boolean(log.human_review_required)
                const hasError = Boolean(log.error)
                const accentColor = hasError ? 'var(--state-danger)' : needsReview ? 'var(--state-warning)' : 'var(--text-muted)'
                return (
                  <div key={log.id as string} className="rounded p-4" style={{ background: 'var(--bg-panel)' }}>
                    <div className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: accentColor }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          {Boolean(log.agent_name) && (
                            <span className="text-[11px] font-mono" style={{ color: 'var(--text-primary)' }}>
                              {log.agent_name as string}
                            </span>
                          )}
                          {needsReview && (
                            <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--state-warning)' }}>review required</span>
                          )}
                          {Boolean(log.confidence_level) && (
                            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{log.confidence_level as string} confidence</span>
                          )}
                          <span className="text-[10px] ml-auto" style={{ color: 'var(--text-dim)' }}>
                            {new Date(log.created_at as string).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                          </span>
                        </div>
                        {Boolean(log.action_taken) && (
                          <p className="text-[13px] mt-1.5" style={{ color: 'var(--text-primary)' }}>{log.action_taken as string}</p>
                        )}
                        {hub && (
                          <Link href={`/h/${String(hub.slug)}`} className="text-[11px] mt-1 inline-block" style={{ color: 'var(--text-muted)' }}>
                            {hub.name as string}
                          </Link>
                        )}
                        {Boolean(log.result) && (
                          <div className="mt-2 text-[11px] line-clamp-2 leading-relaxed" style={{ color: 'var(--text-body)' }}>
                            {log.result as string}
                          </div>
                        )}
                        {hasError && (
                          <div className="mt-2 text-[11px] rounded px-3 py-2" style={{ color: 'var(--state-danger)', background: 'rgba(248, 113, 113, 0.05)' }}>
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
      </div>
    </div>
  )
}
