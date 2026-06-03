// ─── Marketing agent (Genius/Vibe, promoted from gabriel:daily step 7) ──────
// Turns Solomon's SEO findings (or lane context) into 3 specific, low-cost,
// approval-gated marketing actions for today's focus lane.

import { callClaudeJSON } from '@/lib/ai/claude'
import type { Agent } from '../types'

interface SeoFinding { lane: string; keyword_patterns?: string[]; content_gaps?: string[]; opportunities?: string[] }
interface VibeInput { activeLanes: string[]; focusLane?: string; seoReports?: SeoFinding[]; date?: string }

export const vibeMarketingAgent: Agent<VibeInput, { recommendations: string[] }> = {
  name: 'marketing.vibe',
  description: 'Generates 3 specific zero-budget marketing actions for the focus lane (SEO-informed). (gabriel:daily step 7)',
  kind: 'llm',
  taskType: 'campaign_strategy',
  inputSchema: {
    type: 'object', required: ['activeLanes'],
    properties: { activeLanes: { type: 'array', items: { type: 'string' } }, focusLane: { type: 'string' }, seoReports: { type: 'array' }, date: { type: 'string' } },
  },
  outputSchema: { type: 'object', required: ['recommendations'], properties: { recommendations: { type: 'array' } } },
  async run(input, ctx) {
    const dayOfWeek = new Date().getDay()
    const focusLane = input.focusLane ?? input.activeLanes[dayOfWeek % input.activeLanes.length]
    const date = input.date ?? new Date().toISOString().slice(0, 10)
    const reports = input.seoReports ?? []
    const seoContext = reports.length
      ? `Solomon's SEO findings today:\n${reports.map((r) => `${r.lane}:\n  Keywords: ${(r.keyword_patterns ?? []).slice(0, 3).join(', ')}\n  Gaps: ${(r.content_gaps ?? [])[0] || 'none'}\n  Top opportunity: ${(r.opportunities ?? [])[0] || 'none'}`).join('\n\n')}`
      : 'No SEO data available — make recommendations based on lane context only.'

    const system = `You are Genius, Alfred Colvin's marketing and conversion specialist in Indianapolis, Indiana.
You give specific, doable, low-cost marketing actions. Never vague. Never guaranteed results.
Never suggest mass outreach or auto-posting. Alfred approves everything before it goes out.
Keep each recommendation under 2 sentences.`
    const { json } = await callClaudeJSON<{ recommendations?: string[] } | string[]>({
      taskType: 'campaign_strategy', system, lane: focusLane,
      user: `Focus lane today: ${focusLane}\nAll active lanes: ${input.activeLanes.join(', ')}\nDate: ${date}\n\n${seoContext}\n\nGive exactly 3 marketing actions Alfred can take TODAY for the "${focusLane}" lane. Each completable in under 2 hours with zero budget.\nReturn JSON: { "recommendations": ["Action 1: ...", "Action 2: ...", "Action 3: ..."] }`,
      maxTokensOverride: 600,
    })
    const recs = Array.isArray(json) ? json : (json.recommendations ?? [])
    ctx.log(`${recs.length} recommendations for ${focusLane}`)
    return { recommendations: recs.slice(0, 3) }
  },
}
