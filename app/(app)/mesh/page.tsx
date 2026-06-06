// Hermes Agent Mesh — observability dashboard (Phase 5).
// Shows every registered agent, grouped by domain, with live run stats from
// agent_runs (Supabase, local JSONL fallback) plus the Supervisor status.
import { getMeshSnapshot, type AgentRow } from '@/lib/hermes/observability'
import { supervise } from '@/lib/hermes/supervisor'

export const dynamic = 'force-dynamic'

const GROUP_LABEL: Record<string, string> = {
  remotion: '🎬 Video Studio', leads: '🎯 Leads', content: '✍️ Content', outreach: '✉️ Outreach',
  seo: '🔍 SEO', marketing: '📣 Marketing', report: '📊 Reporting', funnel: '🪝 Funnels',
  calendar: '🗓️ Calendar', gate: '🛡️ Gates', admin: '🩺 Admin / Ops', sample: '🧪 Samples',
}

function statusColor(s: string | null): string {
  if (s === 'ok') return 'var(--state-success)'
  if (s === 'error') return 'var(--state-danger)'
  if (s === 'circuit_open') return 'var(--state-warning)'
  return 'var(--text-muted)'
}

export default async function MeshPage() {
  const [snap, sup] = await Promise.all([getMeshSnapshot(), supervise()])

  const groups = new Map<string, AgentRow[]>()
  for (const a of snap.agents) {
    const g = a.name.split('.')[0]
    const arr = groups.get(g) ?? []
    arr.push(a); groups.set(g, arr)
  }
  const orderedGroups = [...groups.entries()].sort((a, b) => (GROUP_LABEL[a[0]] ?? a[0]).localeCompare(GROUP_LABEL[b[0]] ?? b[0]))

  return (
    <div className="min-h-screen">
      <div className="px-10 pt-10 pb-6 max-w-6xl">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Agent Mesh</h1>
        <p className="text-[13px] mt-1" style={{ color: 'var(--text-body)' }}>
          {snap.totals.agents} agents · {snap.totals.runs} runs logged · {snap.totals.okRate}% success
        </p>

        {/* Supervisor banner */}
        <div className="mt-5 rounded-lg p-4" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2">
            <span style={{ color: sup.healthy ? 'var(--state-success)' : 'var(--state-danger)' }}>
              {sup.healthy ? '● Healthy' : '● Attention needed'}
            </span>
            <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
              Supervisor · {sup.audit.successRate}% ok · {sup.errors24h.errorCount} errors/24h · {sup.breakers.filter(b => b.open).length} breakers open · avg {sup.audit.avgLatencyMs}ms
            </span>
          </div>
          {sup.alerts.length > 0 && (
            <ul className="mt-2 text-[12px]" style={{ color: 'var(--state-warning)' }}>
              {sup.alerts.map((a, i) => <li key={i}>⚠ {a}</li>)}
            </ul>
          )}
        </div>
      </div>

      <div className="px-10 pb-16 max-w-6xl space-y-8">
        {orderedGroups.map(([key, rows]) => (
          <section key={key}>
            <h2 className="text-[13px] font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
              {GROUP_LABEL[key] ?? key} <span style={{ color: 'var(--text-muted)' }}>· {rows.length}</span>
            </h2>
            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              {rows.map((a, i) => (
                <div key={a.name} className="flex items-center gap-4 px-4 py-2.5 text-[13px]"
                  style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border)', background: 'var(--surface-1)' }}>
                  <span className="font-mono" style={{ color: 'var(--text-primary)', minWidth: 220 }}>{a.name}</span>
                  <span className="text-[11px] px-1.5 py-0.5 rounded" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>{a.kind}</span>
                  <span className="flex-1" style={{ color: 'var(--text-muted)' }}>{a.description?.slice(0, 70)}</span>
                  <span style={{ color: 'var(--text-body)', minWidth: 60, textAlign: 'right' }}>{a.runs} runs</span>
                  <span style={{ color: a.runs ? 'var(--text-body)' : 'var(--text-muted)', minWidth: 48, textAlign: 'right' }}>{a.runs ? `${a.okRate}%` : '—'}</span>
                  <span style={{ color: statusColor(a.lastStatus), minWidth: 90, textAlign: 'right' }}>
                    {a.lastStatus ? `● ${a.lastStatus}` : 'never run'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
