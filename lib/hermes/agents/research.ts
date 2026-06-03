// ─── Research / Lead Finder agent (promoted from gabriel:daily step 3) ──────
// Self-contained web lead discovery: Brave Search → Claude extraction, with the
// same per-lane competitor/non-buyer exclusion rules as the inline scout.
// Returns extracted prospect profiles (no scoring — that's leads.scoring).

import * as https from 'https'
import * as zlib from 'zlib'
import { callClaudeJSON } from '@/lib/ai/claude'
import type { Agent } from '../types'

const BRAVE_KEY = process.env.BRAVE_SEARCH_API_KEY || ''

interface SearchResult { url: string; title: string; description: string }

function braveSearch(query: string, limit = 5): Promise<SearchResult[]> {
  if (!BRAVE_KEY) return Promise.resolve([])
  return new Promise((resolve) => {
    const params = new URLSearchParams({ q: query, count: String(Math.min(limit, 20)), search_lang: 'en', country: 'us' })
    const req = https.request({
      hostname: 'api.search.brave.com', path: `/res/v1/web/search?${params}`, method: 'GET',
      headers: { Accept: 'application/json', 'Accept-Encoding': 'gzip', 'X-Subscription-Token': BRAVE_KEY },
    }, (res) => {
      const chunks: Buffer[] = []
      res.on('data', (c: Buffer) => chunks.push(c))
      res.on('end', () => {
        const raw = Buffer.concat(chunks)
        const parse = (buf: Buffer) => {
          try {
            const p = JSON.parse(buf.toString('utf8'))
            resolve(((p?.web?.results ?? []) as Array<{ url: string; title: string; description: string }>).map((r) => ({ url: r.url, title: r.title, description: r.description })))
          } catch { resolve([]) }
        }
        if (res.headers['content-encoding'] === 'gzip') zlib.gunzip(raw, (e, d) => (e ? resolve([]) : parse(d)))
        else parse(raw)
      })
    })
    req.on('error', () => resolve([]))
    req.end()
  })
}

// Same exclusion text as gabriel:daily step 3 (keeps extraction behavior aligned).
const EXCLUSION_RULES: Record<string, string> = {
  colvin_enterprises: `\nCRITICAL — COMPETITOR EXCLUSION: Alfred SELLS AI automation/consulting. EXCLUDE any company that itself sells AI automation, AI consulting, workflow automation, web design, marketing, or software services — those are COMPETITORS. A valid prospect is a business in a DIFFERENT industry (clinic, CPA, contractor, retailer, law firm) that would BUY automation.`,
  music_theory_secrets: `\nCRITICAL — COMPETITOR EXCLUSION: Alfred SELLS gospel/music-theory education. EXCLUDE other piano teachers, music schools, online course brands (Pianote, PianoGroove, Hear and Play), and anyone whose title is instructor/teacher/tutor. A valid prospect is an INDIVIDUAL aspiring pianist, church/worship musician, or choir director improving THEIR OWN playing.`,
  first_keys_indy: `\nCRITICAL — NON-BUYER EXCLUSION: Needs INDIVIDUAL first-time homebuyers in Marion County. EXCLUDE lenders, banks, credit unions, realtors, housing agencies (HUD, IHCDA, FHLB, INHP), nonprofits, counselors, media, and aggregators (Bankrate, SoFi, Zillow). A valid prospect is a real renter/first-time buyer.`,
  funding_ready_indiana: `\nCRITICAL — NON-BUYER EXCLUSION: Needs INDIVIDUAL small-business owners or nonprofit leaders in Indiana. EXCLUDE government agencies (SBA, SBDC, IEDC), CDFIs, chambers, banks, lenders, QuickBooks, and grant-directory sites. A valid prospect is a real business owner or nonprofit director needing funding.`,
}

interface FinderInput { lane: string; queries: string[]; max?: number }
interface Prospect { name: string | null; company: string; title: string | null; linkedin_url: string | null; email: string | null; fit_reason: string; source_url: string }

export const leadFinderAgent: Agent<FinderInput, { leads: Prospect[]; sources: number }> = {
  name: 'leads.finder',
  description: 'Discovers prospect profiles via Brave Search + Claude extraction with per-lane exclusion rules. (gabriel:daily step 3)',
  kind: 'llm',
  taskType: 'lead_scoring',
  inputSchema: {
    type: 'object', required: ['lane', 'queries'],
    properties: { lane: { type: 'string' }, queries: { type: 'array', items: { type: 'string' } }, max: { type: 'number' } },
  },
  outputSchema: {
    type: 'object', required: ['leads', 'sources'],
    properties: { leads: { type: 'array' }, sources: { type: 'number' } },
  },
  async run(input, ctx) {
    const max = input.max ?? 5
    const seen = new Set<string>()
    const results: SearchResult[] = []
    for (const q of input.queries) {
      const r = await braveSearch(q, max)
      for (const x of r) if (!seen.has(x.url)) { seen.add(x.url); results.push(x) }
      await new Promise((res) => setTimeout(res, 800))
    }
    ctx.log(`gathered ${results.length} unique sources from ${input.queries.length} queries`)
    if (results.length === 0) return { leads: [], sources: 0 }

    const scrapedContext = results.slice(0, 8).map((r, i) => `[${i + 1}] ${r.title || 'Unknown'} — ${r.url}\n${r.description || ''}`).join('\n\n---\n\n')
    const exclusion = EXCLUSION_RULES[input.lane] ?? ''
    const system = `You are Lead Scout for Alfred Colvin's business "${input.lane}" in Indianapolis.
Extract real prospect profiles from the web research. ONLY use companies/people mentioned in the source material.
Do NOT invent names. If a real person's name is not mentioned, leave name as null. Include any visible email, else null.
Do NOT assign quality scores.${exclusion}
Return JSON: { "leads": [ { "name": string|null, "company": string, "title": string|null, "linkedin_url": string|null, "email": string|null, "fit_reason": string, "source_url": string } ] }
Max ${max} prospects.`

    const { json } = await callClaudeJSON<{ leads: Prospect[] }>({
      taskType: 'lead_scoring', system, lane: input.lane,
      user: `Web research:\n\n${scrapedContext}`, maxTokensOverride: 2000,
    })
    const leads = (json.leads ?? []).filter((l) => l && l.company)
    ctx.log(`extracted ${leads.length} prospect(s)`)
    return { leads, sources: results.length }
  },
}
