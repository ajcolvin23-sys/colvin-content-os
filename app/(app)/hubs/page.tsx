import { createAdminClient } from '@/lib/supabase/admin'
import type { Hub } from '@/lib/crm/types'
import { HubsClient } from './HubsClient'

export const dynamic = 'force-dynamic'

async function getHubs(): Promise<Hub[]> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('hubs')
      .select('*')
      .order('priority')
      .order('name')

    if (error) return []
    return (data as Hub[]) ?? []
  } catch {
    return []
  }
}

export default async function HubsPage() {
  const hubs = await getHubs()
  return <HubsClient initialHubs={hubs} />
}
