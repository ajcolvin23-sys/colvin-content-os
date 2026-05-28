import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import type { Hub, CrmTask, ResearchNote, Prompt, CrmAutomation, RevenueOpportunity } from '@/lib/crm/types'
import { HubDetail } from './HubDetail'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ tab?: string }>
}

async function getHubData(slug: string) {
  const supabase = createAdminClient()

  const { data: hub, error: hubError } = await supabase
    .from('hubs')
    .select('*')
    .eq('slug', slug)
    .single()

  if (hubError || !hub) return null

  const [tasks, leads, research, prompts, automations, revenue] = await Promise.allSettled([
    supabase.from('crm_tasks').select('*').eq('hub_id', hub.id).order('priority').order('created_at', { ascending: false }),
    supabase.from('leads').select('id, name, company, status, qualification_score, created_at').eq('hub_id', hub.id).limit(50),
    supabase.from('research_notes').select('*').eq('hub_id', hub.id).order('created_at', { ascending: false }),
    supabase.from('prompts').select('*').eq('hub_id', hub.id).order('created_at', { ascending: false }),
    supabase.from('crm_automations').select('*').eq('hub_id', hub.id).order('created_at', { ascending: false }),
    supabase.from('revenue_opportunities').select('*').eq('hub_id', hub.id).order('amount', { ascending: false }),
  ])

  return {
    hub: hub as Hub,
    tasks: (tasks.status === 'fulfilled' ? tasks.value.data : []) as CrmTask[] ?? [],
    leads: (leads.status === 'fulfilled' ? leads.value.data : []) as Record<string, unknown>[] ?? [],
    research: (research.status === 'fulfilled' ? research.value.data : []) as ResearchNote[] ?? [],
    prompts: (prompts.status === 'fulfilled' ? prompts.value.data : []) as Prompt[] ?? [],
    automations: (automations.status === 'fulfilled' ? automations.value.data : []) as CrmAutomation[] ?? [],
    revenue: (revenue.status === 'fulfilled' ? revenue.value.data : []) as RevenueOpportunity[] ?? [],
  }
}

export default async function HubDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { tab } = await searchParams
  const data = await getHubData(slug)

  if (!data) notFound()

  return <HubDetail {...data} activeTab={tab ?? 'overview'} />
}
