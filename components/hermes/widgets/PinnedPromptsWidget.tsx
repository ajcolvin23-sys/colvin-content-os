import { createAdminClient } from '@/lib/supabase/admin'
import { WidgetShell, WidgetEmpty } from './WidgetShell'

interface Prompt { id: string; title: string; category: string | null; use_case: string | null }

export async function PinnedPromptsWidget({ hubId }: { hubId: string; hubSlug: string; hubColor: string | null }) {
  let prompts: Prompt[] = []
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('prompts')
      .select('id, title, category, use_case')
      .eq('hub_id', hubId)
      .eq('status', 'Active')
      .order('title')
      .limit(6)
    prompts = (data ?? []) as Prompt[]
  } catch { /* empty */ }

  return (
    <WidgetShell title="Prompts" meta={prompts.length > 0 ? `${prompts.length}` : undefined}>
      {prompts.length === 0 ? (
        <WidgetEmpty message="No prompts in this hub" />
      ) : (
        <div>
          {prompts.map(p => (
            <div key={p.id} className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] truncate" style={{ color: 'var(--text-primary)' }}>
                  {p.title}
                </div>
                {p.use_case && (
                  <div className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
                    {p.use_case}
                  </div>
                )}
              </div>
              <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {p.category}
              </div>
            </div>
          ))}
        </div>
      )}
    </WidgetShell>
  )
}
