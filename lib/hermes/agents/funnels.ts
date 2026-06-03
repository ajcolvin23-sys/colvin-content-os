// ─── Funnel agents (Phase 3 — net-new capability group) ─────────────────────
// Turns an audience into captured leads: positioning → lead magnet → landing
// page → intake form → nurture → thank-you, plus a conversion audit. All
// review-only (never published). funnel.builder composes them via Hermes.

import { callClaudeJSON } from '@/lib/ai/claude'
import type { Agent } from '../types'
import { runPipeline } from '../index'
import { registerAgent, hasAgent } from '../registry'

const VOICE = 'Alfred Colvin — Indianapolis AI consultant. Direct, warm, faith-rooted. No fabricated stats/clients/ROI; label any outcome [example].'

// 1) Offer positioning
interface OfferIn { lane: string; transformation?: string; audience?: string }
export const offerPositioningAgent: Agent<OfferIn, { uvp: string; positioning_statement: string; differentiators: string[] }> = {
  name: 'funnel.offer-positioning', kind: 'llm', taskType: 'campaign_strategy',
  description: 'Unique value prop + positioning statement + differentiators for a lane.',
  inputSchema: { type: 'object', required: ['lane'], properties: { lane: { type: 'string' }, transformation: { type: 'string' }, audience: { type: 'string' } } },
  outputSchema: { type: 'object', required: ['uvp', 'positioning_statement', 'differentiators'], properties: { uvp: { type: 'string' }, positioning_statement: { type: 'string' }, differentiators: { type: 'array' } } },
  async run(input, ctx) {
    const { json } = await callClaudeJSON<{ uvp: string; positioning_statement: string; differentiators: string[] }>({
      taskType: 'campaign_strategy', lane: input.lane,
      system: `${VOICE} Write crisp market positioning. Return JSON: { uvp, positioning_statement, differentiators: string[3] }`,
      user: `Lane: ${input.lane}. Transformation: ${input.transformation ?? ''}. Audience: ${input.audience ?? 'small businesses, churches, nonprofits, advisors'}.`,
    })
    ctx.log('positioned'); return { uvp: json.uvp ?? '', positioning_statement: json.positioning_statement ?? '', differentiators: json.differentiators ?? [] }
  },
}

// 2) Lead magnet
interface LmIn { lane: string; audience?: string; painPoint?: string }
export const leadMagnetAgent: Agent<LmIn, { type: string; title: string; outline: string[]; cta: string }> = {
  name: 'funnel.lead-magnet', kind: 'llm', taskType: 'content_generation',
  description: 'Designs a lead magnet (checklist/guide/template/audit) that converts.',
  inputSchema: { type: 'object', required: ['lane'], properties: { lane: { type: 'string' }, audience: { type: 'string' }, painPoint: { type: 'string' } } },
  outputSchema: { type: 'object', required: ['type', 'title', 'outline', 'cta'], properties: { type: { type: 'string' }, title: { type: 'string' }, outline: { type: 'array' }, cta: { type: 'string' } } },
  async run(input, ctx) {
    const { json } = await callClaudeJSON<{ type: string; title: string; outline: string[]; cta: string }>({
      taskType: 'content_generation', lane: input.lane,
      system: `${VOICE} Design ONE high-converting lead magnet. Return JSON: { type, title, outline: string[4-6], cta }`,
      user: `Lane: ${input.lane}. Audience: ${input.audience ?? 'primary audience'}. Pain: ${input.painPoint ?? ''}.`,
    })
    ctx.log(`lead magnet: ${json.title}`); return { type: json.type ?? 'Checklist', title: json.title ?? '', outline: json.outline ?? [], cta: json.cta ?? '' }
  },
}

// 3) Landing page copy
interface LpIn { lane: string; offer: string; audience?: string }
interface LpOut { hero: { headline: string; subhead: string; cta: string }; sections: Array<{ heading: string; body: string }>; faq: Array<{ q: string; a: string }> }
export const landingPageCopyAgent: Agent<LpIn, LpOut> = {
  name: 'funnel.landing-page-copy', kind: 'llm', taskType: 'content_generation',
  description: 'Section-by-section landing page copy (hero, sections, FAQ).',
  inputSchema: { type: 'object', required: ['lane', 'offer'], properties: { lane: { type: 'string' }, offer: { type: 'string' }, audience: { type: 'string' } } },
  outputSchema: { type: 'object', required: ['hero', 'sections'], properties: { hero: { type: 'object' }, sections: { type: 'array' }, faq: { type: 'array' } } },
  async run(input, ctx) {
    const { json } = await callClaudeJSON<LpOut>({
      taskType: 'content_generation', lane: input.lane,
      system: `${VOICE} Write a landing page. Return JSON: { hero: { headline, subhead, cta }, sections: [{heading, body}]x3-4, faq: [{q,a}]x3 }`,
      user: `Lane: ${input.lane}. Offer: ${input.offer}. Audience: ${input.audience ?? ''}.`, maxTokensOverride: 1200,
    })
    ctx.log(`landing: ${(json.sections ?? []).length} sections`); return { hero: json.hero ?? { headline: '', subhead: '', cta: '' }, sections: json.sections ?? [], faq: json.faq ?? [] }
  },
}

// 4) Intake form
interface FormIn { lane: string; goal?: string }
export const formQuestionAgent: Agent<FormIn, { fields: Array<{ label: string; type: string; required: boolean }> }> = {
  name: 'funnel.form-question', kind: 'llm', taskType: 'content_generation',
  description: 'Designs a short, high-completion intake form for a lane.',
  inputSchema: { type: 'object', required: ['lane'], properties: { lane: { type: 'string' }, goal: { type: 'string' } } },
  outputSchema: { type: 'object', required: ['fields'], properties: { fields: { type: 'array' } } },
  async run(input, ctx) {
    const { json } = await callClaudeJSON<{ fields: Array<{ label: string; type: string; required: boolean }> }>({
      taskType: 'content_generation', lane: input.lane,
      system: `${VOICE} Design a SHORT intake form (4-6 fields max, high completion). Return JSON: { fields: [{label, type, required}] }`,
      user: `Lane: ${input.lane}. Goal: ${input.goal ?? 'qualify and capture the lead'}.`, maxTokensOverride: 400,
    })
    ctx.log(`form: ${(json.fields ?? []).length} fields`); return { fields: json.fields ?? [] }
  },
}

// 5) Nurture sequence
interface NurtIn { lane: string; offer: string; weeks?: number }
export const nurtureSequenceAgent: Agent<NurtIn, { emails: Array<{ day: number; subject: string; body: string }> }> = {
  name: 'funnel.nurture-sequence', kind: 'llm', taskType: 'content_generation',
  description: 'Multi-touch nurture email sequence (review-only, never sent).',
  inputSchema: { type: 'object', required: ['lane', 'offer'], properties: { lane: { type: 'string' }, offer: { type: 'string' }, weeks: { type: 'number' } } },
  outputSchema: { type: 'object', required: ['emails'], properties: { emails: { type: 'array' } } },
  async run(input, ctx) {
    const { json } = await callClaudeJSON<{ emails: Array<{ day: number; subject: string; body: string }> }>({
      taskType: 'content_generation', lane: input.lane,
      system: `${VOICE} Write a ${input.weeks ?? 4}-email nurture sequence (value-first, soft CTA, never pushy). Keep each body under 120 words. Return JSON: { emails: [{day, subject, body}] }`,
      user: `Lane: ${input.lane}. Offer: ${input.offer}.`, maxTokensOverride: 3000,
    })
    ctx.log(`nurture: ${(json.emails ?? []).length} emails`); return { emails: json.emails ?? [] }
  },
}

// 6) Thank-you page
interface TyIn { lane: string; nextStep?: string }
export const thankYouPageAgent: Agent<TyIn, { headline: string; body: string; cta: string; next_steps: string[] }> = {
  name: 'funnel.thank-you-page', kind: 'llm', taskType: 'content_generation',
  description: 'Thank-you page copy + next steps after opt-in.',
  inputSchema: { type: 'object', required: ['lane'], properties: { lane: { type: 'string' }, nextStep: { type: 'string' } } },
  outputSchema: { type: 'object', required: ['headline', 'body', 'cta', 'next_steps'], properties: { headline: { type: 'string' }, body: { type: 'string' }, cta: { type: 'string' }, next_steps: { type: 'array' } } },
  async run(input, ctx) {
    const { json } = await callClaudeJSON<{ headline: string; body: string; cta: string; next_steps: string[] }>({
      taskType: 'content_generation', lane: input.lane,
      system: `${VOICE} Write a thank-you page that drives the next step. Return JSON: { headline, body, cta, next_steps: string[2-3] }`,
      user: `Lane: ${input.lane}. Next step: ${input.nextStep ?? 'book a call'}.`, maxTokensOverride: 400,
    })
    ctx.log('thank-you'); return { headline: json.headline ?? '', body: json.body ?? '', cta: json.cta ?? '', next_steps: json.next_steps ?? [] }
  },
}

// 7) Conversion audit
interface AuditIn { funnelDescription: string }
export const conversionAuditAgent: Agent<AuditIn, { score: number; issues: string[]; recommendations: string[] }> = {
  name: 'funnel.conversion-audit', kind: 'llm', taskType: 'qa_review',
  description: 'Audits a funnel/landing description for conversion issues.',
  inputSchema: { type: 'object', required: ['funnelDescription'], properties: { funnelDescription: { type: 'string' } } },
  outputSchema: { type: 'object', required: ['score', 'issues', 'recommendations'], properties: { score: { type: 'number' }, issues: { type: 'array' }, recommendations: { type: 'array' } } },
  async run(input, ctx) {
    const { json } = await callClaudeJSON<{ score: number; issues: string[]; recommendations: string[] }>({
      taskType: 'qa_review',
      system: `You are a CRO specialist. Audit for friction, clarity, trust, and CTA strength. Return JSON: { score: 1-10, issues: string[], recommendations: string[] }`,
      user: input.funnelDescription.slice(0, 2000), maxTokensOverride: 600,
    })
    ctx.log(`audit score ${json.score}`); return { score: Number(json.score) || 0, issues: json.issues ?? [], recommendations: json.recommendations ?? [] }
  },
}

export const FUNNEL_AGENTS: Agent[] = [
  offerPositioningAgent, leadMagnetAgent, landingPageCopyAgent, formQuestionAgent,
  nurtureSequenceAgent, thankYouPageAgent, conversionAuditAgent,
]

// 8) funnel.builder — composes a full funnel through Hermes
export interface BuiltFunnel {
  ok: boolean; runId: string
  positioning: unknown; leadMagnet: unknown; landingPage: unknown; form: unknown; nurture: unknown; thankYou: unknown
}
export async function buildFunnel(input: { lane: string; transformation?: string; audience?: string; painPoint?: string }): Promise<BuiltFunnel> {
  for (const a of FUNNEL_AGENTS) if (!hasAgent(a.name)) registerAgent(a)
  const result = await runPipeline(
    [
      { agent: 'funnel.offer-positioning', map: () => ({ lane: input.lane, transformation: input.transformation, audience: input.audience }) },
      { agent: 'funnel.lead-magnet', map: () => ({ lane: input.lane, audience: input.audience, painPoint: input.painPoint }) },
      { agent: 'funnel.landing-page-copy', map: (acc) => ({ lane: input.lane, offer: (acc['funnel.lead-magnet'] as { title: string }).title, audience: input.audience }) },
      { agent: 'funnel.form-question', map: () => ({ lane: input.lane }) },
      { agent: 'funnel.nurture-sequence', map: (acc) => ({ lane: input.lane, offer: (acc['funnel.lead-magnet'] as { title: string }).title }) },
      { agent: 'funnel.thank-you-page', map: () => ({ lane: input.lane }) },
    ],
    { lane: input.lane }, { name: 'funnel.builder', lane: input.lane },
  )
  return {
    ok: result.ok, runId: result.runId,
    positioning: result.outputs['funnel.offer-positioning'], leadMagnet: result.outputs['funnel.lead-magnet'],
    landingPage: result.outputs['funnel.landing-page-copy'], form: result.outputs['funnel.form-question'],
    nurture: result.outputs['funnel.nurture-sequence'], thankYou: result.outputs['funnel.thank-you-page'],
  }
}
