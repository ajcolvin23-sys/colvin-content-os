// Server component: loads hubs + active scope + hub-specific sidebar config,
// then renders the client SidebarNav.
import { createAdminClient } from '@/lib/supabase/admin'
import { getActiveHubScope } from '@/lib/crm/hub-scope'
import { getHubWorkspace, getHubSidebar } from '@/lib/crm/hub-config'
import SidebarNav from './SidebarNav'

interface HubRow {
  id: string
  name: string
  slug: string
  color: string | null
  priority: string | null
}

export default async function Sidebar() {
  let hubs: HubRow[] = []
  let scope: string | null = null
  let activeHubSlug: string | null = null

  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('hubs')
      .select('id, name, slug, color, priority')
      .order('name')
    hubs = (data ?? []) as HubRow[]
    const priorityOrder: Record<string, number> = {
      Critical: 0, High: 1, Medium: 2, Low: 3, Future: 4,
    }
    hubs.sort((a, b) =>
      (priorityOrder[a.priority ?? 'Medium'] ?? 5) - (priorityOrder[b.priority ?? 'Medium'] ?? 5)
    )
  } catch {
    // DB unavailable → empty hub list
  }

  try {
    scope = await getActiveHubScope()
  } catch {
    scope = null
  }

  // If scope is a hub id, resolve to its slug for the workspace config
  if (scope) {
    const active = hubs.find(h => h.id === scope)
    activeHubSlug = active?.slug ?? null
  }

  const workspace = getHubWorkspace(activeHubSlug)
  const hubSidebar = activeHubSlug ? getHubSidebar(activeHubSlug) : undefined
  const hubDailyBrief = activeHubSlug ? workspace.daily_brief : undefined

  return (
    <SidebarNav
      hubs={hubs}
      activeScope={scope}
      activeHubSlug={activeHubSlug}
      hubSidebar={hubSidebar}
      hubDailyBrief={hubDailyBrief}
    />
  )
}
