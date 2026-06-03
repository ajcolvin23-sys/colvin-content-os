// ─── Lead agents (promoted from gabriel:daily steps 9 & 10) ─────────────────
// Deterministic, self-contained — faithful re-expressions of the proven steps,
// now individually callable + validated + observable through the runner.

import type { Agent } from '../types'

interface ScorableLead { qualification_score: number; [k: string]: unknown }

// Step 9 — keep leads scoring >= 5, sort high → low.
export const leadScoringAgent: Agent<{ leads: ScorableLead[] }, { scored: ScorableLead[] }> = {
  name: 'leads.scoring',
  description: 'Filters leads below qualification threshold (5) and sorts high→low. (gabriel:daily step 9)',
  kind: 'deterministic',
  inputSchema: {
    type: 'object', required: ['leads'],
    properties: { leads: { type: 'array', items: { type: 'object', required: ['qualification_score'] } } },
  },
  outputSchema: {
    type: 'object', required: ['scored'],
    properties: { scored: { type: 'array' } },
  },
  async run(input, ctx) {
    const scored = input.leads
      .filter((l) => Number(l.qualification_score) >= 5)
      .sort((a, b) => Number(b.qualification_score) - Number(a.qualification_score))
    ctx.log(`scored: ${scored.length}/${input.leads.length} kept`)
    return { scored }
  },
}

interface DedupLead { linkedin_url?: string | null; company?: string | null; [k: string]: unknown }

// Step 8 — drop leads contacted within the last 30 days (by linkedin_url OR company).
// Self-contained: opens its own admin client; falls back to passthrough with no DB.
export const leadDedupAgent: Agent<{ leads: DedupLead[] }, { unique: DedupLead[]; removed: number }> = {
  name: 'leads.dedup',
  description: 'Removes leads contacted in the last 30 days (linkedin_url + company check). (gabriel:daily step 8)',
  kind: 'deterministic',
  inputSchema: {
    type: 'object', required: ['leads'],
    properties: { leads: { type: 'array' } },
  },
  outputSchema: {
    type: 'object', required: ['unique', 'removed'],
    properties: { unique: { type: 'array' }, removed: { type: 'number' } },
  },
  async run(input, ctx) {
    const leads = input.leads
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin')
      const supabase = createAdminClient()
      const linkedinUrls = leads.map((l) => l.linkedin_url).filter(Boolean) as string[]
      const companyNames = leads.map((l) => l.company).filter(Boolean) as string[]
      const [linkedinResult, companyResult] = await Promise.all([
        linkedinUrls.length ? supabase.from('leads').select('linkedin_url, company, last_contacted_at').in('linkedin_url', linkedinUrls) : Promise.resolve({ data: [] as Array<Record<string, unknown>> }),
        companyNames.length ? supabase.from('leads').select('linkedin_url, company, last_contacted_at').in('company', companyNames) : Promise.resolve({ data: [] as Array<Record<string, unknown>> }),
      ])
      const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000
      const recent = (rows: Array<Record<string, unknown>> | null, key: string) => new Set<string>(
        (rows ?? []).filter((r) => r.last_contacted_at && new Date(r.last_contacted_at as string).getTime() > cutoff).map((r) => r[key] as string).filter(Boolean),
      )
      const recentLinkedins = recent(linkedinResult.data, 'linkedin_url')
      const recentCompanies = recent(companyResult.data, 'company')
      const unique = leads.filter((l) => (l.linkedin_url ? !recentLinkedins.has(l.linkedin_url) : !recentCompanies.has(l.company ?? '')))
      ctx.log(`dedup: ${unique.length} unique (removed ${leads.length - unique.length})`)
      return { unique, removed: leads.length - unique.length }
    } catch {
      ctx.log('dedup: no DB — passthrough (0 removed)')
      return { unique: leads, removed: 0 }
    }
  },
}

interface Prioritized { priority_score: number; [k: string]: unknown }

// Step 10 — route outputs into review queues.
export const categorizeAgent: Agent<
  { outreach: Prioritized[]; content: unknown[]; seo: unknown[] },
  { outreach: Prioritized[]; content: unknown[]; seo: unknown[] }
> = {
  name: 'leads.categorize',
  description: 'Routes outputs into review queues (outreach priority>=7, all content/seo). (gabriel:daily step 10)',
  kind: 'deterministic',
  inputSchema: {
    type: 'object', required: ['outreach', 'content', 'seo'],
    properties: { outreach: { type: 'array' }, content: { type: 'array' }, seo: { type: 'array' } },
  },
  async run(input, ctx) {
    const outreach = input.outreach.filter((d) => Number(d.priority_score) >= 7)
    ctx.log(`categorized: ${outreach.length} outreach / ${input.content.length} content / ${input.seo.length} seo`)
    return { outreach, content: input.content, seo: input.seo }
  },
}
