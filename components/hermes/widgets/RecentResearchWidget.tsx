import { createAdminClient } from '@/lib/supabase/admin'
import { WidgetShell, WidgetEmpty } from './WidgetShell'

interface Note { id: string; title: string; evidence_quality: string; created_at: string }

export async function RecentResearchWidget({ hubId }: { hubId: string; hubSlug: string; hubColor: string | null }) {
  let notes: Note[] = []
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('research_notes')
      .select('id, title, evidence_quality, created_at')
      .eq('hub_id', hubId)
      .order('created_at', { ascending: false })
      .limit(6)
    notes = (data ?? []) as Note[]
  } catch { /* empty */ }

  return (
    <WidgetShell title="Research" meta={notes.length > 0 ? `${notes.length}` : undefined}>
      {notes.length === 0 ? (
        <WidgetEmpty message="No research notes yet" />
      ) : (
        <div>
          {notes.map(n => (
            <div key={n.id} className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <div className="flex-1 text-[12px] truncate" style={{ color: 'var(--text-primary)' }}>
                {n.title}
              </div>
              <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {n.evidence_quality}
              </div>
            </div>
          ))}
        </div>
      )}
    </WidgetShell>
  )
}
