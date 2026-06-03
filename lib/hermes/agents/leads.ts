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
