// ─── Outreach agent (promoted from gabriel:daily step 4) ────────────────────
// Wraps the cold-email generation for a single lead. Faithful to step 4's prompt
// so output matches the inline path. Never sends — produces a draft for review.

import { callClaudeJSON } from '@/lib/ai/claude'
import type { Agent } from '../types'

interface EmailLead {
  name?: string
  title?: string
  company: string
  email?: string
  lane: string
  fit_reason?: string
}
interface EmailInput {
  lead: EmailLead
  cta: string
  ctaLink?: string
  maxWords?: number
}
interface EmailOutput { subject: string; draft: string; compliance_flags: string[] }

const SIGNOFF: Record<string, string> = {
  colvin_enterprises: 'Colvin Enterprises',
  first_keys_indy: 'First Keys Indy',
  music_theory_secrets: 'Music Theory Secrets',
}

export const emailCopyAgent: Agent<EmailInput, EmailOutput> = {
  name: 'outreach.email-copy',
  description: 'Writes a cold outreach email draft for one lead (review-only, never sent). (gabriel:daily step 4)',
  kind: 'llm',
  taskType: 'outreach_drafts',
  inputSchema: {
    type: 'object', required: ['lead', 'cta'],
    properties: {
      lead: { type: 'object', required: ['company', 'lane'], properties: { company: { type: 'string' }, lane: { type: 'string' } } },
      cta: { type: 'string' }, ctaLink: { type: 'string' }, maxWords: { type: 'number' },
    },
  },
  outputSchema: {
    type: 'object', required: ['subject', 'draft'],
    properties: { subject: { type: 'string' }, draft: { type: 'string' }, compliance_flags: { type: 'array' } },
  },
  async run(input, ctx) {
    const { lead, cta, ctaLink } = input
    const maxWords = input.maxWords ?? 300
    const signoff = SIGNOFF[lead.lane] ?? 'Alfred Colvin'
    const system = `You are the Outreach Agent for Alfred Colvin. Write a cold outreach email (max ${maxWords} words) for this lead.
Alfred is an AI automation consultant and entrepreneur in Indianapolis. His voice: direct, warm, faith-rooted. Never corporate. Never generic.

EMAIL STRUCTURE (follow exactly):
1. Subject line: under 8 words, no clickbait, no exclamation marks. Specific to their industry.
2. Opening line: NOT "I hope this finds you well" or "My name is..." — start with a specific observation about their business or industry pain.
3. Body (2–3 short paragraphs): Name the problem relevant to their role → hint at the solution → reference Alfred's relevant lane offer. No walls of text.
4. CTA: one soft ask only — link to a resource OR book a call. Use: "${cta}"${ctaLink ? ` — ${ctaLink}` : ''}
5. Sign-off: Alfred Colvin | ${signoff} | Indianapolis, IN

RULES: No fake case studies. No "I was browsing LinkedIn". No "I loved your post". No guaranteed results.
Return JSON: { subject: string, draft: string, compliance_flags: string[] }`

    const { json } = await callClaudeJSON<EmailOutput>({
      taskType: 'outreach_drafts', system, lane: lead.lane,
      user: `Lead: ${lead.name ?? '[Contact]'}, ${lead.title ?? 'unknown role'} at ${lead.company}. Email: ${lead.email ?? '[unknown]'}. Lane: ${lead.lane}. Why they fit: ${lead.fit_reason ?? ''}`,
    })
    ctx.log(`drafted email for ${lead.company}: "${(json.subject ?? '').slice(0, 40)}"`)
    return { subject: json.subject ?? `Quick note — ${lead.company}`, draft: json.draft ?? '', compliance_flags: json.compliance_flags ?? [] }
  },
}

// ── Multi-step outreach sequence (Phase 3 — Outbound Sequence Agent) ─────────
interface SeqInput { lead: EmailLead; cta: string; steps?: number }
interface SeqStep { step: number; day: number; channel: string; subject?: string; body: string }
export const outreachSequenceAgent: Agent<SeqInput, { sequence: SeqStep[] }> = {
  name: 'outreach.sequence',
  description: 'Designs a multi-step follow-up sequence for a lead (review-only, never sent).',
  kind: 'llm', taskType: 'outreach_drafts',
  inputSchema: { type: 'object', required: ['lead', 'cta'], properties: { lead: { type: 'object' }, cta: { type: 'string' }, steps: { type: 'number' } } },
  outputSchema: { type: 'object', required: ['sequence'], properties: { sequence: { type: 'array' } } },
  async run(input, ctx) {
    const steps = input.steps ?? 4
    const { json } = await callClaudeJSON<{ sequence: SeqStep[] }>({
      taskType: 'outreach_drafts', lane: input.lead.lane,
      system: `You are the Outreach Sequence Agent for Alfred Colvin (Indianapolis, AI automation). Design a ${steps}-touch follow-up sequence that is value-first, never pushy, spaced over ~2 weeks. Each touch adds new value (insight, resource, soft ask). No fabricated proof. CTA: "${input.cta}". Return JSON: { sequence: [{ step, day, channel ("email"|"linkedin"), subject, body }] }`,
      user: `Lead: ${input.lead.name ?? '[Contact]'} at ${input.lead.company} (${input.lead.title ?? 'unknown role'}). Lane: ${input.lead.lane}. Fit: ${input.lead.fit_reason ?? ''}.`,
      maxTokensOverride: 2200,
    })
    ctx.log(`${(json.sequence ?? []).length}-touch sequence`)
    return { sequence: json.sequence ?? [] }
  },
}
