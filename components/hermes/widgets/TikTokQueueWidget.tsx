import { createAdminClient } from '@/lib/supabase/admin'
import { WidgetShell, WidgetEmpty } from './WidgetShell'

interface Item { id: string; title: string; status: string; publish_date: string | null; hook: string | null; lane: string | null }

export async function TikTokQueueWidget({ hubSlug }: { hubId: string; hubSlug: string; hubColor: string | null }) {
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
      .select('id, title, status, publish_date, hook, lane')
      .eq('lane', lane)
      .eq('platform', 'tiktok')
      .order('publish_date', { ascending: true, nullsFirst: false })
      .limit(8)
    items = (data ?? []) as Item[]
  } catch { /* empty */ }

  const draftCount = items.filter(i => ['draft', 'needs_review'].includes(i.status)).length
  const scheduledCount = items.filter(i => i.status === 'scheduled').length

  return (
    <WidgetShell title="TikTok Queue" meta={`${draftCount} draft · ${scheduledCount} scheduled`}>
      {items.length === 0 ? (
        <WidgetEmpty message="No TikTok content in queue" />
      ) : (
        <div>
          {items.map(item => (
            <div key={item.id} className="py-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center gap-3">
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{
                    background: item.status === 'scheduled' ? 'var(--state-success)'
                      : item.status === 'needs_review' ? 'var(--state-warning)'
                      : 'var(--text-muted)'
                  }}
                />
                <div className="flex-1 text-[12px] truncate" style={{ color: 'var(--text-primary)' }}>
                  {item.hook ?? item.title}
                </div>
                {item.publish_date && (
                  <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    {new Date(item.publish_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </WidgetShell>
  )
}
