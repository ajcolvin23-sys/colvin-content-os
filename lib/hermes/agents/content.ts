// ─── Content agents (promoted from gabriel:daily step 5) ────────────────────
// Wraps the Colvin infographic engine as a mesh agent so it's individually
// callable, validated, and observable. The underlying generator is unchanged.

import type { Agent } from '../types'
import { callClaudeJSON } from '@/lib/ai/claude'
import { generateColvinInfographic } from '@/automation-os/scripts/gen-colvin-infographic'

// Minimal evidence guard (mirrors the spirit of the daily-run hallucination scan).
const CLAIM_PATTERNS = [/\b\d+% (?:increase|more|growth|roi|of (?:clients|customers))\b/i, /guaranteed?\b/i, /\$[\d,]+ (?:in revenue|saved|earned|profit)/i, /\bourstomers? (?:saw|got)\b/i]
function claimFlags(text: string): string[] {
  return CLAIM_PATTERNS.filter((re) => re.test(text)).map((re) => re.source)
}

interface InfographicInput { model: string; cta: string; dateStr: string; outDir: string }
interface InfographicOutput { pngPath: string; htmlPath: string; title: string }

export const colvinInfographicAgent: Agent<InfographicInput, InfographicOutput> = {
  name: 'content.colvin-infographic',
  description: 'Generates the daily Colvin Enterprises branded LinkedIn infographic PNG (fresh topic). (gabriel:daily step 5)',
  kind: 'llm',
  taskType: 'content_generation',
  inputSchema: {
    type: 'object', required: ['model', 'cta', 'dateStr', 'outDir'],
    properties: { model: { type: 'string' }, cta: { type: 'string' }, dateStr: { type: 'string' }, outDir: { type: 'string' } },
  },
  outputSchema: {
    type: 'object', required: ['pngPath', 'htmlPath', 'title'],
    properties: { pngPath: { type: 'string' }, htmlPath: { type: 'string' }, title: { type: 'string' } },
  },
  async run(input, ctx) {
    const { info, pngPath, htmlPath } = await generateColvinInfographic({
      model: input.model, cta: input.cta, dateStr: input.dateStr, outDir: input.outDir,
    })
    const title = `${info.title_line1} ${info.title_line2}`.trim()
    ctx.log(`infographic: ${title}`)
    return { pngPath, htmlPath, title }
  },
}

// ── LinkedIn post (Hook-Story-Offer) — promoted from step 5 ─────────────────
interface PostInput { lane: string; hook: string; transformation?: string; rungLabel?: string; focusNote?: string; cta: string }
interface PostOutput { draft: string; character_count: number; flags: string[] }

export const linkedInPostAgent: Agent<PostInput, PostOutput> = {
  name: 'content.linkedin-post',
  description: 'Writes a Hook-Story-Offer LinkedIn post with a one-shot evidence retry. (gabriel:daily step 5)',
  kind: 'llm',
  taskType: 'content_generation',
  inputSchema: {
    type: 'object', required: ['lane', 'hook', 'cta'],
    properties: { lane: { type: 'string' }, hook: { type: 'string' }, transformation: { type: 'string' }, rungLabel: { type: 'string' }, focusNote: { type: 'string' }, cta: { type: 'string' } },
  },
  outputSchema: {
    type: 'object', required: ['draft', 'character_count'],
    properties: { draft: { type: 'string' }, character_count: { type: 'number' }, flags: { type: 'array' } },
  },
  async run(input, ctx) {
    const system = `You are Genius, Alfred Colvin's content strategist. Write a LinkedIn post using the Hook-Story-Offer framework.

Alfred's voice: professional, warm, direct, faith-rooted. Indianapolis-based. Never corporate or generic.

FRAMEWORK — follow in this exact order:
1. HOOK (1 line): Use this exact hook verbatim: "${input.hook}"
   Rules: No emoji on this line. No rhetorical "Are you..." questions. This line must stop the scroll.
2. STORY (2–3 short paragraphs): Build belief and transfer conviction. Show a before/after or reframe.
   Lane transformation being sold: "${input.transformation ?? ''}"
   Current focus: ${input.rungLabel ?? 'current offer'} — ${input.focusNote ?? ''}
   CRITICAL: Do NOT invent specific clients, revenue numbers, or case study results.
   If referencing an outcome, label it [example scenario] or [hypothesis].
3. OFFER (1–2 lines): One clear next step matched to the current rung — no more.
   CTA: "${input.cta}"

Format: Hook line + blank line + story paragraphs + blank line + CTA.
Length: 900–1300 characters total.
Return JSON: { draft: string, character_count: number }`

    const first = await callClaudeJSON<{ draft: string }>({
      taskType: 'content_generation', system, lane: input.lane,
      user: `Write the Hook-Story-Offer LinkedIn post for ${input.lane}. Indianapolis context. No fabricated proof.`,
    })
    let draft = first.json.draft ?? ''
    let flags = claimFlags(draft)

    if (flags.length) {
      ctx.log('evidence flagged — one retry')
      const retry = await callClaudeJSON<{ draft: string }>({
        taskType: 'content_generation', lane: input.lane,
        system: system + '\nFINAL RULE: Zero specific clients, zero fabricated results, zero unverifiable numbers. Label any outcome as [example scenario].',
        user: `Rewrite for ${input.lane}. No invented proof. Keep the hook verbatim.`,
      }).catch(() => ({ json: { draft: '' } }))
      const rd = retry.json.draft ?? ''
      if (rd && claimFlags(rd).length === 0) { draft = rd; flags = [] }
    }
    ctx.log(`post ${draft.length} chars${flags.length ? ` (flags: ${flags.length})` : ''}`)
    return { draft, character_count: draft.length, flags }
  },
}
