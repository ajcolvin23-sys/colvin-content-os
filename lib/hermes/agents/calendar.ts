// ─── Content Calendar agent (Phase 3 — net-new) ─────────────────────────────
// Plans a balanced multi-lane content calendar and flags gaps. Review-only.

import { callClaudeJSON } from '@/lib/ai/claude'
import type { Agent } from '../types'

interface CalInput { lanes: string[]; daysAhead?: number; recentTopics?: string[] }
interface CalEntry { date: string; lane: string; content_type: string; theme: string }

export const calendarPlannerAgent: Agent<CalInput, { plan: CalEntry[]; gaps: string[] }> = {
  name: 'calendar.planner',
  description: 'Plans a balanced content calendar across lanes and flags coverage gaps.',
  kind: 'llm', taskType: 'campaign_strategy',
  inputSchema: { type: 'object', required: ['lanes'], properties: { lanes: { type: 'array', items: { type: 'string' } }, daysAhead: { type: 'number' }, recentTopics: { type: 'array' } } },
  outputSchema: { type: 'object', required: ['plan', 'gaps'], properties: { plan: { type: 'array' }, gaps: { type: 'array' } } },
  async run(input, ctx) {
    const days = input.daysAhead ?? 7
    const start = new Date().toISOString().slice(0, 10)
    const avoid = (input.recentTopics ?? []).slice(-10)
    const { json } = await callClaudeJSON<{ plan: CalEntry[]; gaps: string[] }>({
      taskType: 'campaign_strategy',
      system: `You are Alfred Colvin's content calendar planner (Indianapolis). Plan a balanced ${days}-day calendar across the given lanes — vary content types (post, carousel, infographic, video, email), avoid repeating recent themes, and flag any lane with thin coverage. Return JSON: { plan: [{date (YYYY-MM-DD), lane, content_type, theme}], gaps: string[] }`,
      user: `Lanes: ${input.lanes.join(', ')}. Start date: ${start}. Days: ${days}.${avoid.length ? ` Avoid recent themes: ${avoid.join('; ')}.` : ''}`,
      maxTokensOverride: 1400,
    })
    ctx.log(`planned ${(json.plan ?? []).length} entries, ${(json.gaps ?? []).length} gaps`)
    return { plan: json.plan ?? [], gaps: json.gaps ?? [] }
  },
}
