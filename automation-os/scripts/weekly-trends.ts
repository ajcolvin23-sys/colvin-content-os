#!/usr/bin/env ts-node
/**
 * Weekly Trends — Platform Engagement Research
 *
 * Runs every Sunday at 20:00 UTC (3 PM CST) via Vercel cron.
 * Scrapes trending content per active lane via Firecrawl + Brave Search.
 * Uses Claude Opus to extract winning hook patterns + format insights.
 * Stores findings in research_notes so Monday morning's content gen
 * knows what's actually working in each niche.
 *
 * Run manually:  npm run weekly:trends
 * Cron:          /api/cron/weekly-trends
 *
 * Output: 1 research_note per active lane per week, evidence_quality='Strong Evidence',
 *         tagged ['weekly_trends', lane, 'platform_engagement']
 */
import * as fs from 'fs'
import * as path from 'path'
import * as https from 'https'

// ── Load env ────────────────────────────────────────────────────────────────
const envPath = path.resolve(__dirname, '../../.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim(); if (!t || t.startsWith('#')) continue
    const i = t.indexOf('='); if (i < 0) continue
    if (!process.env[t.slice(0, i).trim()]) process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim()
  }
}

import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const FIRECRAWL_KEY = process.env.FIRECRAWL_API_KEY ?? ''
const BRAVE_KEY = process.env.BRAVE_SEARCH_API_KEY ?? ''

// Lane → research focus mapping
const LANE_RESEARCH: Record<string, { name: string; platforms: string[]; queries: string[]; hub_slug: string }> = {
  colvin_enterprises: {
    name: 'Colvin Enterprises',
    platforms: ['linkedin', 'tiktok'],
    hub_slug: 'colvin-enterprises',
    queries: [
      'top LinkedIn posts AI automation small business 2026',
      'viral TikTok small business AI workflow this week',
      'best LinkedIn hook formats SMB AI consulting',
    ],
  },
  first_keys_indy: {
    name: 'First Keys Indy',
    platforms: ['facebook', 'tiktok'],
    hub_slug: 'first-keys-indy',
    queries: [
      'viral TikTok first time homebuyer down payment grant 2026',
      'top Facebook posts minority homebuyer education',
      'redlining education content engagement trends',
    ],
  },
  music_theory_secrets: {
    name: 'Music Theory Secrets',
    platforms: ['facebook', 'tiktok'],
    hub_slug: 'music-theory-secrets',
    queries: [
      'viral TikTok gospel piano chord progression 2026',
      'best piano content hooks Facebook church musicians',
      'top music theory short form video trends',
    ],
  },
  indiana_backflow: {
    name: 'Indiana Backflow',
    platforms: ['facebook', 'google'],
    hub_slug: 'indiana-backflow',
    queries: [
      'backflow testing local SEO trends 2026 Indiana',
      'plumbing contractor lead generation content',
    ],
  },
}

interface BraveResult { title: string; url: string; description: string }

async function braveSearch(query: string, count = 8): Promise<BraveResult[]> {
  if (!BRAVE_KEY) return []
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.search.brave.com',
      path: `/res/v1/web/search?q=${encodeURIComponent(query)}&count=${count}`,
      headers: { 'Accept': 'application/json', 'X-Subscription-Token': BRAVE_KEY },
    }, (res) => {
      let data = ''
      res.on('data', c => { data += c })
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data)
          const results = (parsed.web?.results ?? []).map((r: { title: string; url: string; description: string }) => ({
            title: r.title, url: r.url, description: r.description,
          }))
          resolve(results)
        } catch { resolve([]) }
      })
    })
    req.on('error', () => resolve([]))
    req.setTimeout(15000, () => { req.destroy(); resolve([]) })
    req.end()
  })
}

async function analyzeLane(lane: string, info: typeof LANE_RESEARCH[string]) {
  console.log(`\n[${lane}] Researching ${info.platforms.join(' + ')}...`)

  // Gather raw search results across all queries
  const allResults: BraveResult[] = []
  for (const q of info.queries) {
    const results = await braveSearch(q, 6)
    console.log(`  "${q.slice(0, 60)}..." → ${results.length} results`)
    allResults.push(...results)
  }
  if (allResults.length === 0) {
    console.log(`  No results — skipping ${lane}`)
    return
  }

  // De-dup by URL
  const seen = new Set<string>()
  const uniq = allResults.filter(r => { if (seen.has(r.url)) return false; seen.add(r.url); return true })

  // Synthesize with Claude Opus
  const summaryInput = uniq.slice(0, 30).map((r, i) =>
    `[${i + 1}] ${r.title}\n    ${r.description}\n    ${r.url}`
  ).join('\n\n')

  const system = `You are Gabriel's platform engagement research analyst.

Your job: read raw search results about what's working on ${info.platforms.join(' / ')} for the ${info.name} niche, and extract the actionable patterns Alfred should use in next week's content.

DO NOT invent statistics. DO NOT cite specific view counts unless they appear in the raw results.

Return Markdown with these exact sections:

## Top patterns this week
(3-5 hook formats / content angles that appear repeatedly in the results)

## What to copy
(specific, actionable: "open with X", "use Y format", "frame as Z")

## What to avoid
(patterns that look played out, oversaturated, or compliance-risky for this niche)

## One contrarian angle
(a counter-narrative to what's trending — Alfred's voice argues against consensus)

## Evidence quality
Strong Evidence | Reasoned Inference | Assumption — pick one with one-line justification

Keep it tight. 400 words max total.`

  const result = await anthropic.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 2000,
    system,
    messages: [{
      role: 'user',
      content: `Niche: ${info.name}\nPlatforms: ${info.platforms.join(', ')}\n\nRaw search results:\n\n${summaryInput}`
    }],
  })

  const analysisText = result.content
    .filter(b => b.type === 'text')
    .map(b => (b.type === 'text' ? b.text : ''))
    .join('')

  // Extract evidence quality (Strong Evidence | Reasoned Inference | Assumption)
  const eqMatch = analysisText.match(/## Evidence quality\s*\n+\s*(Strong Evidence|Reasoned Inference|Assumption)/i)
  const evidenceQuality = eqMatch?.[1] ?? 'Reasoned Inference'

  // Find hub by slug
  const { data: hub } = await supabase
    .from('hubs')
    .select('id')
    .eq('slug', info.hub_slug)
    .maybeSingle()

  if (!hub) {
    console.log(`  No hub found for slug ${info.hub_slug} — skipping save`)
    return
  }

  // Save as research_note
  const today = new Date().toISOString().split('T')[0]
  const { error } = await supabase.from('research_notes').insert({
    hub_id: hub.id,
    title: `Weekly trends — ${info.name} — ${today}`,
    source: `Brave Search synthesis (${uniq.length} results across ${info.platforms.join(', ')})`,
    summary: analysisText,
    evidence_quality: evidenceQuality,
    tags: ['weekly_trends', lane, 'platform_engagement', ...info.platforms],
    action_items: 'Reference this note in Monday\'s content generation. Pick 1-2 patterns to test this week.',
  })

  if (error) {
    console.log(`  Save failed: ${error.message}`)
  } else {
    console.log(`  ✅ Saved research_note for ${info.name} (${evidenceQuality})`)
  }
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗')
  console.log('║         WEEKLY PLATFORM ENGAGEMENT RESEARCH                  ║')
  console.log(`║         ${new Date().toISOString().slice(0, 10)}                                     ║`)
  console.log('╚══════════════════════════════════════════════════════════════╝')

  if (!BRAVE_KEY) {
    console.error('BRAVE_SEARCH_API_KEY not set — cannot do trend research. Set it in Vercel.')
    process.exit(1)
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY not set')
    process.exit(1)
  }

  for (const [lane, info] of Object.entries(LANE_RESEARCH)) {
    try {
      await analyzeLane(lane, info)
    } catch (err) {
      console.log(`  ✗ ${lane} failed: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  console.log('\nWeekly trends research complete.')
}

main().catch(e => { console.error('FATAL:', e); process.exit(1) })
