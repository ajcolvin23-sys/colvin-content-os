// Server component that loads hubs + active scope, then renders the client SidebarNav.
import { createAdminClient } from '@/lib/supabase/admin'
import { getActiveHubScope } from '@/lib/crm/hub-scope'
import SidebarNav from './SidebarNav'

interface HubRow {
  id: string
  name: string
  slug: string
  color: string | null
  priority: string | null
}

export default async function Sidebar() {
  // Load all hubs ordered by priority (Critical → High → Medium → Low → Future)
  // and scope cookie. Both fail gracefully — sidebar renders even if DB is down.
  let hubs: HubRow[] = []
  let scope: string | null = null

  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('hubs')
      .select('id, name, slug, color, priority')
      .order('name')
    hubs = (data ?? []) as HubRow[]
    // Sort by priority manually since text ordering doesn't match logical order
    const priorityOrder: Record<string, number> = {
      'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3, 'Future': 4,
    }
    hubs.sort((a, b) =>
      (priorityOrder[a.priority ?? 'Medium'] ?? 5) - (priorityOrder[b.priority ?? 'Medium'] ?? 5)
    )
  } catch {
    // DB unavailable → empty hub list; selector will show "All hubs" only
  }

  try {
    scope = await getActiveHubScope()
  } catch {
    scope = null
  }

  return <SidebarNav hubs={hubs} activeScope={scope} />
}
