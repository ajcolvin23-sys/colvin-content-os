import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getClientsOf } from '@/lib/crm/hub-config'

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
  revenue_potential: string | null
}

async function getParentHub(slug: string): Promise<Hub | null> {
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('hubs')
      .select('id, name, slug, description, status, priority, color, next_action, revenue_potential')
      .eq('slug', slug)
      .maybeSingle()
    return data as Hub | null
  } catch { return null }
}

async function getClientHubs(slugs: string[]): Promise<Hub[]> {
  if (slugs.length === 0) return []
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('hubs')
      .select('id, name, slug, description, status, priority, color, next_action, revenue_potential')
      .in('slug', slugs)
    return (data ?? []) as Hub[]
  } catch { return [] }
}

export default async function ClientsPage({ params }: PageProps) {
  const { slug } = await params
  const parent = await getParentHub(slug)
  if (!parent) notFound()

  const clientSlugs = getClientsOf(slug)
  const clients = await getClientHubs(clientSlugs)

  return (
    <div className="min-h-screen">
      <div className="px-10 pt-10 pb-6" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="max-w-5xl">
          <div className="text-[11px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
            {parent.name}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Clients
          </h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--text-body)' }}>
            {clients.length === 0 ? 'No client engagements yet' : `${clients.length} active client engagement${clients.length === 1 ? '' : 's'}`}
          </p>
        </div>
      </div>

      <div className="px-10 py-10">
        <div className="max-w-5xl">
          {clients.length === 0 ? (
            <div className="py-12 text-center text-[13px]" style={{ color: 'var(--text-dim)' }}>
              No clients yet. Add a client by mapping it under {parent.name} in lib/crm/hub-config.ts.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {clients.map(client => (
                <Link
                  key={client.id}
                  href={`/h/${client.slug}`}
                  className="block rounded p-5 transition-colors"
                  style={{ background: 'var(--bg-panel)' }}
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: client.color ?? '#6b6b6b' }}
                    />
                    <span className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
                      {client.name}
                    </span>
                    <span className="ml-auto text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {client.status}
                    </span>
                  </div>
                  {client.description && (
                    <p className="text-[12px] leading-relaxed line-clamp-2 mt-2" style={{ color: 'var(--text-body)' }}>
                      {client.description}
                    </p>
                  )}
                  {client.next_action && (
                    <div className="mt-3 pt-3 text-[11px]" style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Next: </span>
                      {client.next_action}
                    </div>
                  )}
                  {client.revenue_potential && (
                    <div className="mt-2 text-[10px] tabular-nums" style={{ color: 'var(--text-muted)' }}>
                      {client.revenue_potential}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
