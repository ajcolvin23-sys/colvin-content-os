import { createAdminClient } from '@/lib/supabase/admin'
import { PageHeader } from '@/components/hermes/PageHeader'
import { EvidenceBadge } from '@/components/hermes/EvidenceBadge'
import { EmptyState } from '@/components/hermes/EmptyState'
import { BookOpen } from 'lucide-react'
import Link from 'next/link'
import { getActiveHubScope, getHubLabel } from '@/lib/crm/hub-scope'

export const dynamic = 'force-dynamic'

async function getResearch(scope: string | null) {
  try {
    const supabase = createAdminClient()
    let query = supabase
      .from('research_notes')
      .select(`
        id, title, source, summary, evidence_quality, tags, action_items, created_at,
        hub_id,
        hubs!research_notes_hub_id_fkey (id, name, slug, color)
      `)
      .order('created_at', { ascending: false })
    if (scope) query = query.eq('hub_id', scope)
    const { data, error } = await query
    if (error) return []
    return data ?? []
  } catch {
    return []
  }
}

const QUALITY_ORDER = ['Verified', 'Strong Evidence', 'Reasoned Inference', 'Assumption', 'Needs Verification', 'Outdated', 'Contradicted']

export default async function ResearchPage() {
  const scope = await getActiveHubScope()
  const scopeLabel = await getHubLabel(scope)
  const allNotes = await getResearch(scope) as Record<string, unknown>[]

  const verifiedCount = allNotes.filter(n => n.evidence_quality === 'Verified').length
  const strongCount = allNotes.filter(n => n.evidence_quality === 'Strong Evidence').length
  const needsVerifCount = allNotes.filter(n => n.evidence_quality === 'Needs Verification').length

  // Sort by evidence quality
  const sorted = [...allNotes].sort((a, b) => {
    const ai = QUALITY_ORDER.indexOf(a.evidence_quality as string)
    const bi = QUALITY_ORDER.indexOf(b.evidence_quality as string)
    return ai - bi
  })

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Research Notes"
        subtitle={`${scope ? `${scopeLabel} · ` : ''}${allNotes.length} notes · ${verifiedCount} verified · ${strongCount} strong evidence · ${needsVerifCount} needs verification`}
      />

      {/* Quality summary bar */}
      {allNotes.length > 0 && (
        <div className="flex gap-3 flex-wrap mb-6">
          {QUALITY_ORDER.map(q => {
            const count = allNotes.filter(n => n.evidence_quality === q).length
            if (count === 0) return null
            return (
              <div key={q} className="flex items-center gap-2">
                <EvidenceBadge quality={q} />
                <span className="text-xs text-slate-500">{count}</span>
              </div>
            )
          })}
        </div>
      )}

      {sorted.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No research notes"
          description="Seed the database to load 20 research notes with evidence quality ratings across all hubs."
        />
      ) : (
        <div className="space-y-3">
          {sorted.map(note => {
            const hub = note.hubs as Record<string, unknown> | null
            return (
              <div key={note.id as string} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
                <div className="flex items-start gap-3 mb-2">
                  <EvidenceBadge quality={note.evidence_quality as string} />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white leading-snug">{note.title as string}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      {hub && (
                        <Link href={`/hubs/${hub.slug}`} className="text-xs text-slate-500 hover:text-indigo-400 transition-colors">
                          {hub.name as string}
                        </Link>
                      )}
                      {Boolean(note.source) && <span className="text-xs text-slate-600">{note.source as string}</span>}
                    </div>
                  </div>
                </div>

                {Boolean(note.summary) && (
                  <p className="text-sm text-slate-400 leading-relaxed mb-3">{note.summary as string}</p>
                )}

                {Boolean(note.action_items) && (
                  <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-lg px-3 py-2 text-xs text-slate-400 mb-3">
                    <span className="text-indigo-400 font-medium">Action: </span>
                    {note.action_items as string}
                  </div>
                )}

                {Boolean(note.tags) && (note.tags as string[]).length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {(note.tags as string[]).map(tag => (
                      <span key={tag} className="text-[10px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
