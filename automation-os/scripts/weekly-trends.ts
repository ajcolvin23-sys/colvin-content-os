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
    platforms: ['linkedin'],
    hub_slug: 'colvin-enterprises',
    queries: [
      'top LinkedIn carousels AI automation small business 2026',
      'most-saved LinkedIn infographics AI agents framework this week',
      'best LinkedIn carousel hook formats SMB AI consulting',
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

// ── Vibe Marketing — cross-platform (LinkedIn + Facebook + YouTube) ───────────
// Alfred's "/last30days for vibe marketing" lane. Pulls live Brave results on how
// to market on LinkedIn, Facebook, and YouTube RIGHT NOW (last 30 days framing),
// synthesizes a cross-platform playbook with Claude Opus, and saves it as a
// research_note on the colvin-enterprises hub so the content layer keeps growing.
// Real data only — no fabricated stats, no invented view counts.
async function analyzeVibeMarketing() {
  console.log(`\n[vibe_marketing] Researching LinkedIn + Facebook + YouTube (last 30 days)...`)

  const queries = [
    'vibe marketing strategy 2026 what is working now',
    'best LinkedIn content strategy last 30 days 2026',
    'Facebook organic reach growth tactics 2026',
    'YouTube Shorts growth strategy 2026 what works',
    'short form video hooks going viral this month 2026',
    'AI content creation marketing trends 2026',
  ]

  const allResults: BraveResult[] = []
  for (const q of queries) {
    const results = await braveSearch(q, 6)
    console.log(`  "${q.slice(0, 56)}..." → ${results.length} results`)
    allResults.push(...results)
  }
  if (allResults.length === 0) {
    console.log('  No results — skipping vibe marketing')
    return
  }

  const seen = new Set<string>()
  const uniq = allResults.filter(r => { if (seen.has(r.url)) return false; seen.add(r.url); return true })

  const summaryInput = uniq.slice(0, 36).map((r, i) =>
    `[${i + 1}] ${r.title}\n    ${r.description}\n    ${r.url}`
  ).join('\n\n')

  const system = `You are Gabriel's vibe-marketing strategist for Alfred Colvin (Indianapolis AI consultant, multi-lane entrepreneur).

"Vibe marketing" = riding the current cultural/format wave on each platform with authentic, fast, AI-assisted content — not polished corporate ads.

Your job: read raw last-30-days search results about marketing on LinkedIn, Facebook, and YouTube, and turn them into a cross-platform playbook Alfred can act on THIS WEEK to grow his content layer.

DO NOT invent statistics. DO NOT cite view counts, follower numbers, or % lifts unless they literally appear in the raw results. If a number isn't in the results, speak in patterns, not figures.

Return Markdown with these exact sections:

## The vibe right now (cross-platform)
(2-4 sentences: what's the current content energy/format wave across all three platforms)

## LinkedIn — last 30 days
(3 bullets: hook formats / post styles working now)

## Facebook — last 30 days
(3 bullets: what's driving reach/engagement now)

## YouTube — last 30 days
(3 bullets: Shorts + long-form angles working now)

## Alfred's move this week
(3 specific, do-it-now actions tailored to his lanes: Colvin Enterprises AI consulting, First Keys Indy, Music Theory Secrets)

## What to avoid
(played-out / oversaturated / compliance-risky patterns)

## Evidence quality
Strong Evidence | Reasoned Inference | Assumption — pick one with a one-line justification

Keep it tight. 500 words max total.`

  const result = await anthropic.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 2400,
    system,
    messages: [{
      role: 'user',
      content: `Platforms: LinkedIn, Facebook, YouTube\nFraming: last 30 days, what's working NOW\n\nRaw search results:\n\n${summaryInput}`
    }],
  })

  const analysisText = result.content
    .filter(b => b.type === 'text')
    .map(b => (b.type === 'text' ? b.text : ''))
    .join('')

  const eqMatch = analysisText.match(/## Evidence quality\s*\n+\s*(Strong Evidence|Reasoned Inference|Assumption)/i)
  const evidenceQuality = eqMatch?.[1] ?? 'Reasoned Inference'

  const { data: hub } = await supabase
    .from('hubs')
    .select('id')
    .eq('slug', 'colvin-enterprises')
    .maybeSingle()

  if (!hub) {
    console.log('  No colvin-enterprises hub found — skipping save')
    return
  }

  const today = new Date().toISOString().split('T')[0]
  const { error } = await supabase.from('research_notes').insert({
    hub_id: hub.id,
    title: `Vibe marketing — last 30 days — LinkedIn/Facebook/YouTube — ${today}`,
    source: `Brave Search synthesis (${uniq.length} results across LinkedIn, Facebook, YouTube)`,
    summary: analysisText,
    evidence_quality: evidenceQuality,
    tags: ['vibe_marketing', 'last30days', 'cross_platform', 'linkedin', 'facebook', 'youtube', 'content_growth'],
    action_items: 'Pull "Alfred\'s move this week" into Monday content gen. Test 1 hook format per platform.',
  })

  if (error) {
    console.log(`  Save failed: ${error.message}`)
  } else {
    console.log(`  ✅ Saved vibe-marketing research_note (${evidenceQuality})`)
  }
}

// ── Weekly Video Review — score recent videos against the gold standard ───────
// Reads recent video_projects, scores each render_settings JSON against the
// canonical cinematic rubric (LOCKED UPGRADE 010), and logs a coaching note so
// short-form quality keeps climbing instead of plateauing. Read-only on videos.
function scoreCinematic(v: {
  scenes?: Array<{
    type?: string; duration_seconds?: number; caption_text?: string
    motion_direction?: string; color_grade?: string
    assets?: Array<{ description?: string }>
  }>
}): { score: number; max: number; gaps: string[] } {
  const scenes = v.scenes ?? []
  const gaps: string[] = []
  let score = 0
  const max = 7

  if (scenes.length >= 5) score++; else gaps.push(`only ${scenes.length} scenes (need ≥5)`)
  if (scenes[0]?.type === 'hook' && (scenes[0]?.duration_seconds ?? 99) <= 4) score++
  else gaps.push('opening hook missing or >4s')
  if (scenes.some(s => s.type === 'pain_stack')) score++; else gaps.push('no pain_stack (tension build)')
  if (scenes.some(s => s.type === 'transformation' || s.type === 'desire')) score++; else gaps.push('no transformation/desire (payoff)')
  if (scenes.some(s => s.type === 'cta')) score++; else gaps.push('no cta scene')
  if (scenes.length > 0 && scenes.every(s => s.caption_text?.trim() && s.motion_direction?.trim() && s.color_grade?.trim())) score++
  else gaps.push('some scenes missing caption_text / motion_direction / color_grade')
  if (scenes.length > 0 && scenes.every(s => s.assets?.[0]?.description?.trim())) score++
  else gaps.push('some scenes missing assets[].description for image gen')

  return { score, max, gaps }
}

async function reviewRecentVideos() {
  console.log('\n[video_review] Scoring recent videos against the cinematic standard...')

  const since = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  const { data: videos, error } = await supabase
    .from('video_projects')
    .select('id, title, lane, render_settings, created_at')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(40)

  if (error) { console.log(`  Query failed: ${error.message}`); return }
  if (!videos || videos.length === 0) { console.log('  No recent videos to review.'); return }

  const lines: string[] = []
  let total = 0
  for (const vid of videos) {
    const rs = (vid.render_settings ?? {}) as Parameters<typeof scoreCinematic>[0]
    const { score, max, gaps } = scoreCinematic(rs)
    total += score / max
    const flag = score === max ? '✅' : score >= 5 ? '🟡' : '🔴'
    lines.push(`${flag} ${score}/${max} — ${vid.title ?? vid.id} (${vid.lane ?? '—'})${gaps.length ? `\n    gaps: ${gaps.join('; ')}` : ''}`)
  }
  const avgPct = Math.round((total / videos.length) * 100)

  const summary = [
    `## Weekly video quality review — ${new Date().toISOString().split('T')[0]}`,
    '',
    `Reviewed **${videos.length}** videos from the last 8 days against the 6-scene cinematic standard (hook → pain_stack → desire → mechanism → transformation → cta).`,
    '',
    `**Average adherence: ${avgPct}%**`,
    '',
    '## Per-video scores',
    ...lines,
    '',
    '## Top fixes to lift the standard',
    avgPct >= 90
      ? '- Quality is high. Keep the 6-scene structure locked; experiment with bolder hooks.'
      : '- Enforce the cinematic gate on generation (already wired in gabriel-daily-run). Re-generate any 🔴 below 5/7.',
  ].join('\n')

  console.log(`  Reviewed ${videos.length} videos — avg adherence ${avgPct}%`)

  const { data: hub } = await supabase
    .from('hubs')
    .select('id')
    .eq('slug', 'colvin-enterprises')
    .maybeSingle()
  if (!hub) { console.log('  No colvin-enterprises hub — skipping save'); return }

  const { error: saveErr } = await supabase.from('research_notes').insert({
    hub_id: hub.id,
    title: `Video quality review — ${videos.length} videos — ${new Date().toISOString().split('T')[0]}`,
    source: 'video_projects render_settings scored against LOCKED UPGRADE 010 rubric',
    summary,
    evidence_quality: 'Strong Evidence',
    tags: ['video_review', 'cinematic_standard', 'quality_loop', 'short_form'],
    action_items: 'Re-generate any video scoring below 5/7. Keep the 6-scene structure locked.',
  })
  if (saveErr) console.log(`  Save failed: ${saveErr.message}`)
  else console.log(`  ✅ Saved video quality review (avg ${avgPct}%)`)
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

  // Cross-platform vibe-marketing research (LinkedIn + Facebook + YouTube, last 30 days)
  try {
    await analyzeVibeMarketing()
  } catch (err) {
    console.log(`  ✗ vibe_marketing failed: ${err instanceof Error ? err.message : String(err)}`)
  }

  // Weekly video quality loop — score recent videos against the cinematic standard
  try {
    await reviewRecentVideos()
  } catch (err) {
    console.log(`  ✗ video_review failed: ${err instanceof Error ? err.message : String(err)}`)
  }

  console.log('\nWeekly trends research complete.')
}

main().catch(e => { console.error('FATAL:', e); process.exit(1) })
