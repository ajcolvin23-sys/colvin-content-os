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

// ── Facebook adaptation — promoted from step 5 ──────────────────────────────
interface FbInput { linkedinDraft: string; cta: string }
export const facebookPostAgent: Agent<FbInput, { draft: string }> = {
  name: 'content.facebook-post',
  description: 'Adapts a LinkedIn post for Facebook (community tone, ends with a question). (gabriel:daily step 5)',
  kind: 'llm',
  taskType: 'content_generation',
  inputSchema: { type: 'object', required: ['linkedinDraft', 'cta'], properties: { linkedinDraft: { type: 'string' }, cta: { type: 'string' } } },
  outputSchema: { type: 'object', required: ['draft'], properties: { draft: { type: 'string' } } },
  async run(input, ctx) {
    const system = `You are Genius, Alfred Colvin's content agent. Adapt this LinkedIn post for Facebook.
Rules:
- Community-friendly tone — Indianapolis locals, faith community, entrepreneurs
- Open with the hook compressed for Facebook (conversational, not corporate)
- Under 450 chars
- End with a genuine question that invites comments (not "what do you think?")
- Include the CTA: "${input.cta}"
Return JSON: { draft: string }`
    const { json } = await callClaudeJSON<{ draft: string }>({
      taskType: 'content_generation', system, user: `LinkedIn post to adapt:\n${input.linkedinDraft.slice(0, 800)}`, maxTokensOverride: 400,
    })
    ctx.log(`facebook ${(json.draft ?? '').length} chars`)
    return { draft: json.draft ?? '' }
  },
}

// ── 5-slide carousel — promoted from step 5 ─────────────────────────────────
interface CarouselInput { lane: string; hook: string; transformation?: string; rungLabel?: string; cta: string }
interface Slide { slide_number: number; label: string; text: string; design_note: string }
export const carouselAgent: Agent<CarouselInput, { slides: Slide[]; cover_caption: string; draft: string }> = {
  name: 'content.carousel',
  description: 'Writes a 5-slide Hook-Story-Offer carousel (Hook→Problem→Reframe→Proof→Offer). (gabriel:daily step 5)',
  kind: 'llm',
  taskType: 'content_generation',
  inputSchema: { type: 'object', required: ['lane', 'hook', 'cta'], properties: { lane: { type: 'string' }, hook: { type: 'string' }, transformation: { type: 'string' }, rungLabel: { type: 'string' }, cta: { type: 'string' } } },
  outputSchema: { type: 'object', required: ['slides', 'draft'], properties: { slides: { type: 'array' }, cover_caption: { type: 'string' }, draft: { type: 'string' } } },
  async run(input, ctx) {
    const system = `You are Genius, Alfred Colvin's content strategist. Write a 5-slide carousel post using the Hook-Story-Offer framework.

Alfred's voice: direct, warm, faith-rooted. Indianapolis. Clean, bold text — each slide is read in 3 seconds.

SLIDE STRUCTURE:
Slide 1 — HOOK: "${input.hook}" (large bold text, nothing else)
Slide 2 — THE PROBLEM: One sentence naming the pain or cost. Under 12 words.
Slide 3 — THE REFRAME: The contrarian truth or insight. Under 15 words.
Slide 4 — THE PROOF/STORY: A before/after or example. Label hypothetical as (example). Under 20 words.
Slide 5 — THE OFFER: CTA + next step. "${input.cta}" — under 12 words.

Lane: ${input.lane} | Transformation: "${input.transformation ?? ''}" | Rung: ${input.rungLabel ?? 'current offer'}

Return JSON: { slides: [ { slide_number, label, text, design_note } ], cover_caption: string }`
    const { json } = await callClaudeJSON<{ slides: Slide[]; cover_caption: string }>({
      taskType: 'content_generation', system, lane: input.lane, user: `Write the 5-slide carousel for ${input.lane}. No invented proof.`, maxTokensOverride: 700,
    })
    const slides = json.slides ?? []
    const draft = slides.map((s) => `[Slide ${s.slide_number} — ${s.label}]\n${s.text}\n💡 Design: ${s.design_note}`).join('\n\n') + `\n\n[Cover Caption]\n${json.cover_caption ?? ''}`
    ctx.log(`carousel ${slides.length} slides`)
    return { slides, cover_caption: json.cover_caption ?? '', draft }
  },
}
