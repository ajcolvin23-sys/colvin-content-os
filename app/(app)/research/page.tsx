import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { getActiveHubScope, getHubLabel } from '@/lib/crm/hub-scope'

export const dynamic = 'force-dynamic'

const QUALITY_ORDER = ['Verified', 'Strong Evidence', 'Reasoned Inference', 'Assumption', 'Needs Verification', 'Outdated', 'Contradicted']

const QUALITY_COLOR: Record<string, string> = {
  'Verified': 'var(--state-success)',
  'Strong Evidence': 'var(--accent)',
  'Reasoned Inference': '#7c7cff',
  'Assumption': 'var(--state-warning)',
  'Needs Verification': 'var(--state-warning)',
  'Outdated': 'var(--text-muted)',
  'Contradicted': 'var(--state-danger)',
}

async function getResearch(scope: string | null) {
  try {
    const supabase = createAdminClient()
    let query = supabase
      .from('research_notes')
      .select(`id, title, source, summary, evidence_quality, tags, action_items, created_at, hub_id,
        hubs!research_notes_hub_id_fkey (id, name, slug, color)`)
      .order('created_at', { ascending: false })
    if (scope) query = query.eq('hub_id', scope)
    const { data, error } = await query
    if (error) return []
    return data ?? []
  } catch { return [] }
}

export default async function ResearchPage() {
  const scope = await getActiveHubScope()
  const scopeLabel = await getHubLabel(scope)
  const allNotes = await getResearch(scope) as Record<string, unknown>[]

  const sorted = [...allNotes].sort((a, b) => {
    const ai = QUALITY_ORDER.indexOf(a.evidence_quality as string)
    const bi = QUALITY_ORDER.indexOf(b.evidence_quality as string)
    return ai - bi
  })

  const counts = QUALITY_ORDER.map(q => ({
    q,
    count: allNotes.filter(n => n.evidence_quality === q).length,
  })).filter(c => c.count > 0)

  return (
    <div className="min-h-screen">
      <div className="px-10 pt-10 pb-6">
        <div className="max-w-5xl">
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Research</h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--text-body)' }}>
            {scope ? `${scopeLabel} · ` : ''}{allNotes.length} note{allNotes.length === 1 ? '' : 's'}
          </p>

          {counts.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-5">
              {counts.map(({ q, count }) => (
                <div key={q} className="flex items-center gap-2 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: QUALITY_COLOR[q] }} />
                  <span style={{ color: 'var(--text-body)' }}>{q}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-10 pb-12">
        <div className="max-w-5xl">
          {sorted.length === 0 ? (
            <div className="py-12 text-center text-[13px]" style={{ color: 'var(--text-dim)' }}>No research notes yet</div>
          ) : (
            <div className="space-y-1">
              {sorted.map(note => {
                const hub = note.hubs as Record<string, unknown> | null
                const quality = note.evidence_quality as string
                return (
                  <div key={note.id as string} className="rounded p-4" style={{ background: 'var(--bg-panel)' }}>
                    <div className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: QUALITY_COLOR[quality] ?? 'var(--text-muted)' }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-3 flex-wrap">
                          <h3 className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{note.title as string}</h3>
                          {hub && (
                            <Link href={`/h/${hub.slug as string}`} className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                              {hub.name as string}
                            </Link>
                          )}
                          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{quality}</span>
                          {Boolean(note.source) && (
                            <span className="text-[11px]" style={{ color: 'var(--text-dim)' }}>{note.source as string}</span>
                          )}
                        </div>
                        {Boolean(note.summary) && (
                          <p className="text-[12px] mt-2 leading-relaxed" style={{ color: 'var(--text-body)' }}>{note.summary as string}</p>
                        )}
                        {Boolean(note.action_items) && (
                          <div className="text-[11px] mt-3 pt-2 leading-relaxed" style={{ color: 'var(--text-body)', borderTop: '1px solid var(--border-subtle)' }}>
                            <span style={{ color: 'var(--accent)' }}>Action — </span>
                            {note.action_items as string}
                          </div>
                        )}
                        {Boolean(note.tags) && (note.tags as string[]).length > 0 && (
                          <div className="flex flex-wrap gap-x-3 mt-3">
                            {(note.tags as string[]).map(tag => (
                              <span key={tag} className="text-[10px]" style={{ color: 'var(--text-dim)' }}>#{tag}</span>
                            ))}
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
