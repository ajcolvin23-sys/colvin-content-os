import { createAdminClient } from '@/lib/supabase/admin'
import { PageHeader } from '@/components/hermes/PageHeader'
import { StatusBadge } from '@/components/hermes/StatusBadge'
import { EmptyState } from '@/components/hermes/EmptyState'
import { Zap } from 'lucide-react'
import { PromptsClient } from './PromptsClient'
import { getActiveHubScope, getHubLabel } from '@/lib/crm/hub-scope'

export const dynamic = 'force-dynamic'

async function getPrompts(scope: string | null) {
  try {
    const supabase = createAdminClient()
    let query = supabase
      .from('prompts')
      .select(`
        id, title, category, prompt_text, model_target, use_case, status, created_at,
        hub_id,
        hubs!prompts_hub_id_fkey (id, name, slug)
      `)
      .order('category')
      .order('title')
    if (scope) query = query.eq('hub_id', scope)
    const { data, error } = await query
    if (error) return []
    return data ?? []
  } catch {
    return []
  }
}

export default async function PromptsPage() {
  const scope = await getActiveHubScope()
  const scopeLabel = await getHubLabel(scope)
  const prompts = await getPrompts(scope) as Record<string, unknown>[]
  const categories = Array.from(new Set(prompts.map(p => p.category as string).filter(Boolean)))

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Prompt Library"
        subtitle={`${scope ? `${scopeLabel} · ` : ''}${prompts.length} prompts across ${categories.length} categories`}
      />

      {prompts.length === 0 ? (
        <EmptyState
          icon={Zap}
          title="No prompts yet"
          description="Seed the database to load 20 production-ready prompts for outreach, content, research, and more."
        />
      ) : (
        <PromptsClient prompts={prompts} categories={categories} />
      )}
    </div>
  )
}
