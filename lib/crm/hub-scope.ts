// ─── Hub Scope ────────────────────────────────────────────────────────────────
// Persistent niche filter. When set, every top-level CRM page filters its data
// to only show records for the selected hub. Stored in a cookie so server
// components can read it directly without round-tripping through the client.
// ─────────────────────────────────────────────────────────────────────────────
import { cookies } from 'next/headers'

export const HUB_SCOPE_COOKIE = 'hermes_hub_scope'
export const ALL_HUBS = 'all'

/**
 * Read the currently active hub scope from the cookie.
 * Returns null when scope is "all hubs" (unfiltered view).
 */
export async function getActiveHubScope(): Promise<string | null> {
  const cookieStore = await cookies()
  const value = cookieStore.get(HUB_SCOPE_COOKIE)?.value
  if (!value || value === ALL_HUBS) return null
  return value
}

/**
 * Apply a hub scope filter to a Supabase query builder.
 * No-op when scope is null (all hubs).
 *
 * @example
 *   const scope = await getActiveHubScope()
 *   let query = supabase.from('crm_tasks').select('*')
 *   query = withHubScope(query, scope, 'hub_id')
 */
export function withHubScope<T extends { eq: (col: string, val: string) => T }>(
  query: T,
  scope: string | null,
  column: string = 'hub_id'
): T {
  if (!scope) return query
  return query.eq(column, scope)
}

/**
 * Lookup a hub by id or slug. Used to display the active scope name in the UI.
 */
export async function getHubLabel(scopeIdOrSlug: string | null): Promise<string> {
  if (!scopeIdOrSlug) return 'All hubs'
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const supabase = createAdminClient()
  // Try id first, then slug
  const { data } = await supabase
    .from('hubs')
    .select('name')
    .or(`id.eq.${scopeIdOrSlug},slug.eq.${scopeIdOrSlug}`)
    .maybeSingle()
  return data?.name ?? 'All hubs'
}
