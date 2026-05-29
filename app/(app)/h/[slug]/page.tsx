import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { getHubWorkspace } from '@/lib/crm/hub-config'
import { WidgetRenderer } from '@/components/hermes/widgets/WidgetRenderer'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

interface Hub {
  id: string
  name: string
  slug: string
  description: string | null
  status: string
  priority: string
  color: string | null
  next_action: string | null
}

async function getHub(slug: string): Promise<Hub | null> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('hubs')
      .select('id, name, slug, description, status, priority, color, next_action')
      .eq('slug', slug)
      .maybeSingle()
    if (error) return null
    return data as Hub | null
  } catch {
    return null
  }
}

export default async function HubWorkspacePage({ params }: PageProps) {
  const { slug } = await params
  const hub = await getHub(slug)
  if (!hub) notFound()

  const workspace = getHubWorkspace(slug)

  return (
    <div className="min-h-screen">
      {/* Header — minimal, type-driven */}
      <div className="px-10 pt-10 pb-8" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="max-w-5xl">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: hub.color ?? '#6b6b6b' }}
            />
            <span className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              {hub.status}
            </span>
            <span style={{ color: 'var(--text-dim)' }}>·</span>
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {hub.priority}
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {hub.name}
          </h1>
          {hub.description && (
            <p className="mt-2 text-[13px] max-w-2xl leading-relaxed" style={{ color: 'var(--text-body)' }}>
              {hub.description}
            </p>
          )}
          {hub.next_action && (
            <div
              className="mt-5 inline-flex items-center gap-2.5 px-3 py-2 rounded text-[12px]"
              style={{
                background: 'var(--bg-panel)',
                color: 'var(--text-body)',
                borderLeft: `2px solid ${hub.color ?? 'var(--accent)'}`,
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>Next:</span>
              <span style={{ color: 'var(--text-primary)' }}>{hub.next_action}</span>
            </div>
          )}
        </div>
      </div>

      {/* Widgets grid */}
      <div className="px-10 py-10">
        <div className="max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6">
          {workspace.widgets.map(widget => (
            <WidgetRenderer key={widget} widget={widget} hubId={hub.id} hubSlug={hub.slug} hubColor={hub.color} />
          ))}
        </div>
      </div>
    </div>
  )
}
