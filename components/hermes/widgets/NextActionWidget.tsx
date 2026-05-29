import { createAdminClient } from '@/lib/supabase/admin'
import { WidgetShell } from './WidgetShell'

export async function NextActionWidget({ hubId }: { hubId: string; hubSlug: string; hubColor: string | null }) {
  let nextAction: string | null = null
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('hubs')
      .select('next_action')
      .eq('id', hubId)
      .maybeSingle()
    nextAction = data?.next_action ?? null
  } catch { /* empty */ }

  return (
    <WidgetShell title="Next Action">
      {nextAction ? (
        <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>
          {nextAction}
        </p>
      ) : (
        <p className="text-[12px]" style={{ color: 'var(--text-dim)' }}>
          No next action set.
        </p>
      )}
    </WidgetShell>
  )
}
