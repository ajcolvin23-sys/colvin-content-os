// ─── SEO agent (Solomon, promoted from gabriel:daily step 6) ────────────────
// Live SERP research via Brave → evidence-based Claude analysis. No invented data.

import { callClaudeJSON } from '@/lib/ai/claude'
import type { Agent } from '../types'
import { braveSearch } from './research'

interface SeoInput { lane: string; query: string }
interface SeoOutput {
  lane: string
  query_used: string
  keyword_patterns: string[]
  content_gaps: string[]
  opportunities: string[]
  evidence_urls: string[]
}

export const solomonSeoAgent: Agent<SeoInput, SeoOutput> = {
  name: 'seo.solomon',
  description: 'Live SERP research + evidence-based SEO analysis for a lane/query. (gabriel:daily step 6)',
  kind: 'llm',
  taskType: 'seo_synthesis',
  inputSchema: { type: 'object', required: ['lane', 'query'], properties: { lane: { type: 'string' }, query: { type: 'string' } } },
  outputSchema: {
    type: 'object', required: ['lane', 'query_used', 'opportunities', 'evidence_urls'],
    properties: { lane: { type: 'string' }, query_used: { type: 'string' }, keyword_patterns: { type: 'array' }, content_gaps: { type: 'array' }, opportunities: { type: 'array' }, evidence_urls: { type: 'array' } },
  },
  async run(input, ctx) {
    const serp = await braveSearch(input.query, 8)
    ctx.log(`SERP: ${serp.length} results for "${input.query.slice(0, 40)}"`)
    if (serp.length === 0) {
      return { lane: input.lane, query_used: input.query, keyword_patterns: [], content_gaps: [], opportunities: [], evidence_urls: [] }
    }
    const serpContext = serp.map((r, i) => `[${i + 1}] ${r.title || ''} — ${r.url}\n${r.description || ''}`).join('\n\n')
    const system = `You are Solomon, Alfred Colvin's SEO intelligence specialist based in Indianapolis, Indiana.
Analyze real SERP data and give evidence-based recommendations ONLY.
Never invent keywords or data. Only use what you see in the search results provided.
Never guarantee rankings. Say "may improve" not "will improve".`
    const { json } = await callClaudeJSON<{ keyword_patterns: string[]; content_gaps: string[]; opportunities: string[] }>({
      taskType: 'seo_synthesis', system, lane: input.lane,
      user: `Lane: ${input.lane}\nSearch query: "${input.query}"\n\nREAL SERP RESULTS:\n${serpContext}\n\nReturn JSON: { "keyword_patterns": [up to 5], "content_gaps": [2-3], "opportunities": [3 items each "Opportunity: [action] — evidence: [URL] — impact: low|medium|high"] }`,
      maxTokensOverride: 900,
    })
    ctx.log(`${(json.opportunities ?? []).length} opportunities`)
    return {
      lane: input.lane, query_used: input.query,
      keyword_patterns: (json.keyword_patterns ?? []).slice(0, 5),
      content_gaps: (json.content_gaps ?? []).slice(0, 3),
      opportunities: (json.opportunities ?? []).slice(0, 3),
      evidence_urls: serp.map((r) => r.url).slice(0, 3),
    }
  },
}
