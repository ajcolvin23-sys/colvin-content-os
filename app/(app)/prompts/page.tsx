import { createAdminClient } from '@/lib/supabase/admin'
import { PromptsClient } from './PromptsClient'
import { getActiveHubScope, getHubLabel } from '@/lib/crm/hub-scope'

export const dynamic = 'force-dynamic'

async function getPrompts(scope: string | null) {
  try {
    const supabase = createAdminClient()
    let query = supabase
      .from('prompts')
      .select(`id, title, category, prompt_text, model_target, use_case, status, created_at, hub_id,
        hubs!prompts_hub_id_fkey (id, name, slug)`)
      .order('category')
      .order('title')
    if (scope) query = query.eq('hub_id', scope)
    const { data, error } = await query
    if (error) return []
    return data ?? []
  } catch { return [] }
}

export default async function PromptsPage() {
  const scope = await getActiveHubScope()
  const scopeLabel = await getHubLabel(scope)
  const prompts = await getPrompts(scope) as Record<string, unknown>[]
  const categories = Array.from(new Set(prompts.map(p => p.category as string).filter(Boolean)))

  return (
    <div className="min-h-screen">
      <div className="px-10 pt-10 pb-6">
        <div className="max-w-5xl">
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Prompts</h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--text-body)' }}>
            {scope ? `${scopeLabel} · ` : ''}{prompts.length} prompts · {categories.length} categories
          </p>
        </div>
      </div>

      <div className="px-10 pb-12">
        <div className="max-w-5xl">
          {prompts.length === 0 ? (
            <div className="py-12 text-center text-[13px]" style={{ color: 'var(--text-dim)' }}>
              No prompts yet
            </div>
          ) : (
            <PromptsClient prompts={prompts} categories={categories} />
          )}
        </div>
      </div>
    </div>
  )
}
