import { createAdminClient } from '@/lib/supabase/admin'
import { WidgetShell, WidgetEmpty } from './WidgetShell'

interface Item {
  id: string
  title: string
  platform: string | null
  status: string
  hook: string | null
  lane: string | null
  created_at: string
}

export async function ContentAwaitingReviewWidget({ hubSlug }: { hubId: string; hubSlug: string; hubColor: string | null }) {
  const laneMap: Record<string, string> = {
    'colvin-enterprises': 'colvin_enterprises',
    'music-theory-secrets': 'music_theory_secrets',
    'indiana-backflow': 'indiana_backflow',
    'first-keys-indy': 'first_keys_indy',
    'funding-ready-indiana': 'funding_ready_indiana',
  }
  const lane = laneMap[hubSlug] ?? hubSlug.replace(/-/g, '_')

  let items: Item[] = []
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('content_items')
      .select('id, title, platform, status, hook, lane, created_at')
      .eq('lane', lane)
      .in('status', ['needs_review', 'manual_required'])
      .order('created_at', { ascending: false })
      .limit(8)
    items = (data ?? []) as Item[]
  } catch { /* empty */ }

  return (
    <WidgetShell title="Content Awaiting Review" meta={items.length > 0 ? `${items.length}` : 'Clear'}>
      {items.length === 0 ? (
        <WidgetEmpty message="No content awaiting review" />
      ) : (
        <div>
          {items.map(item => (
            <div key={item.id} className="py-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] truncate" style={{ color: 'var(--text-primary)' }}>{item.title}</div>
                  {item.hook && (
                    <div className="text-[11px] mt-0.5 line-clamp-1" style={{ color: 'var(--text-muted)' }}>
                      {item.hook}
                    </div>
                  )}
                </div>
                <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{item.platform}</div>
              </div>
            </div>
          ))}
          <div className="mt-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>
            Review at <a href="/approvals" style={{ color: 'var(--accent)' }}>/approvals</a>
          </div>
        </div>
      )}
    </WidgetShell>
  )
}
