#!/usr/bin/env ts-node
/**
 * Weekly Blog — one long-form blog draft per week, rotating across active lanes.
 *
 * Runs every Wednesday at 14:00 UTC (9 AM CST) via Vercel cron.
 * Picks the week's lane (rotates colvin → music → first-keys → backflow), pulls
 * live Brave context for a current angle, drafts a full SEO blog post with Claude,
 * scans it for hallucinations, and saves it to content_items as a DRAFT for review.
 *
 * Honors the draft-first rule: status is ALWAYS 'needs_review'. Never auto-publish.
 * Katrina-gated lanes (first_keys_indy) are tagged for compliance review.
 *
 * Run manually:  npm run blog:weekly
 * Cron:          /api/cron/weekly-blog
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
const BRAVE_KEY = process.env.BRAVE_SEARCH_API_KEY ?? ''

// Blog model: prefer config content_generation, fall back to a strong writer
const BLOG_MODEL: string = (() => {
  try {
    const cfg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../config/gabriel-config.json'), 'utf-8'))
    return cfg.model_routing?.content_generation ?? 'claude-sonnet-4-6'
  } catch { return 'claude-sonnet-4-6' }
})()

// Katrina-gated lanes — always need compliance review (LOCKED UPGRADE 008)
const KATRINA_LANES = ['first_keys_indy', 'funding_ready_indiana', 'girls_got_game']

// Rotation: one lane per week, in order.
const LANE_ROTATION: Array<{
  lane: string; name: string; audience: string; voice: string; queries: string[]; cta: string
}> = [
  {
    lane: 'colvin_enterprises',
    name: 'Colvin Enterprises',
    audience: 'small-business owners in Indianapolis curious about AI automation',
    voice: 'direct, practical, warm, faith-rooted — a real operator, not a marketer',
    queries: ['AI automation small business 2026 practical use cases', 'how SMBs use AI to save time 2026'],
    cta: 'Book a free AI workflow audit at https://calendar.app.google/igj4Vfwvc1ZUB3Gc9',
  },
  {
    lane: 'music_theory_secrets',
    name: 'Music Theory Secrets',
    audience: 'church and gospel musicians who play by ear and want to understand theory',
    voice: 'encouraging, plain-spoken, musician-to-musician',
    queries: ['gospel piano chord theory tips 2026', 'learn music theory by ear church musicians'],
    cta: 'Get the free chord guide at https://musictheorysecrets.com',
  },
  {
    lane: 'first_keys_indy',
    name: 'First Keys Indy',
    audience: 'first-time and minority homebuyers in Marion County, Indiana',
    voice: 'warm, trustworthy, empowering — never salesy, never over-promising',
    queries: ['first time homebuyer down payment assistance Indiana 2026', 'Marion County homebuyer programs 2026'],
    cta: 'See if you qualify at https://firstkeysindy.com',
  },
  {
    lane: 'indiana_backflow',
    name: 'Indiana Backflow',
    audience: 'Indiana homeowners and property managers who need backflow testing',
    voice: 'clear, local, no-nonsense, helpful',
    queries: ['backflow testing requirements Indiana 2026', 'why backflow testing matters homeowners'],
    cta: 'Find a certified tester near you at the Indiana Backflow Directory',
  },
]

interface BraveResult { title: string; url: string; description: string }

async function braveSearch(query: string, count = 6): Promise<BraveResult[]> {
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

// ── Hallucination scan — mirror of the daily runner's evidence discipline ─────
const HALLUCINATION_PATTERNS = [
  /\b\d{2,}%\s+(of|increase|growth|more|higher|faster)\b/i,
  /\bstudies (show|have shown|prove)\b/i,
  /\baccording to (a |recent )?(study|report|survey)\b/i,
  /\b(thousands|millions|hundreds) of (clients|customers|users|businesses)\b/i,
  /\bproven to (increase|boost|double|triple)\b/i,
  /\bguaranteed\b/i,
  /\bclients (saw|report|experienced)\b/i,
  /\b\d+x (return|ROI|growth)\b/i,
]
function scanForHallucinations(draft: string): string[] {
  const flags: string[] = []
  for (const p of HALLUCINATION_PATTERNS) if (p.test(draft)) flags.push(p.source)
  return flags
}

// ISO week number → drives the rotation
function isoWeek(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗')
  console.log('║                  WEEKLY BLOG DRAFT                          ║')
  console.log(`║                  ${new Date().toISOString().slice(0, 10)}                                ║`)
  console.log('╚══════════════════════════════════════════════════════════════╝')

  if (!process.env.ANTHROPIC_API_KEY) { console.error('ANTHROPIC_API_KEY not set'); process.exit(1) }

  // Allow forcing a lane:  npm run blog:weekly -- colvin_enterprises
  const forced = process.argv[2]
  const week = isoWeek(new Date())
  const target = forced
    ? (LANE_ROTATION.find(l => l.lane === forced) ?? LANE_ROTATION[week % LANE_ROTATION.length])
    : LANE_ROTATION[week % LANE_ROTATION.length]

  console.log(`\nThis week (ISO week ${week}) → ${target.name} [${target.lane}]`)

  // Live context for a current, real angle
  const ctx: BraveResult[] = []
  for (const q of target.queries) {
    const r = await braveSearch(q, 5)
    console.log(`  "${q.slice(0, 56)}..." → ${r.length} results`)
    ctx.push(...r)
  }
  const ctxText = ctx.slice(0, 12).map((r, i) => `[${i + 1}] ${r.title}\n    ${r.description}\n    ${r.url}`).join('\n\n')

  const isKatrina = KATRINA_LANES.includes(target.lane)
  const system = `You are Gabriel, Alfred Colvin's content writer. Write ONE long-form SEO blog post for the ${target.name} lane.

Audience: ${target.audience}
Voice: ${target.voice}
Call to action: ${target.cta}

RULES (non-negotiable):
- NO fabricated statistics, percentages, study citations, client results, or ROI numbers. If you don't have a real source, write in concrete patterns and examples, not invented figures.
- Write like a real human helping someone — not a marketer.
- 800–1200 words. Scannable: H2/H3 headers, short paragraphs, a few bullet lists.
${isKatrina ? '- COMPLIANCE: this is a regulated housing/finance lane. Never say "guaranteed", "free money", or imply guaranteed approval. Educational tone only.' : ''}

Return ONLY valid JSON:
{
  "title": "SEO blog title — under 65 chars, compelling",
  "slug": "url-slug-kebab-case",
  "meta_description": "under 155 chars",
  "hook": "first sentence that pulls the reader in",
  "body_markdown": "the full blog post in Markdown, including the title as # H1",
  "primary_keyword": "main keyword",
  "internal_cta": "the CTA sentence to place at the end"
}`

  const resp = await anthropic.messages.create({
    model: BLOG_MODEL,
    max_tokens: 4000,
    system,
    messages: [{
      role: 'user',
      content: `Write the weekly blog for ${target.name}.\n\nRecent live context (for a current, real angle — do NOT copy, do NOT invent stats from it):\n\n${ctxText || '(no live results — write from evergreen knowledge, still no invented stats)'}`,
    }],
  })

  const raw = resp.content.filter(b => b.type === 'text').map(b => (b.type === 'text' ? b.text : '')).join('')
  let parsed: { title?: string; slug?: string; meta_description?: string; hook?: string; body_markdown?: string; primary_keyword?: string; internal_cta?: string }
  try {
    parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
  } catch {
    console.error('Blog response was not valid JSON — aborting save.')
    process.exit(1)
  }

  const body = parsed.body_markdown ?? ''
  if (!body || body.length < 400) {
    console.error('Blog body too short — aborting save.')
    process.exit(1)
  }

  const flags = scanForHallucinations(body)
  if (flags.length > 0) {
    console.log(`  ⚠️  Hallucination scan flagged ${flags.length} pattern(s): ${flags.join('; ')}`)
    console.log('  Saving with status needs_review (Alfred must verify flagged claims).')
  }

  const today = new Date().toISOString().split('T')[0]
  const { error } = await supabase.from('content_items').insert({
    lane: target.lane,
    platform: 'blog',
    content_type: 'blog',
    title: `[${target.lane}] blog — ${parsed.title ?? target.name} — ${today}${isKatrina ? ' [katrina_review]' : ''}`,
    hook: (parsed.hook ?? '').slice(0, 300),
    body,
    status: 'needs_review',
    generation_model: BLOG_MODEL,
    created_at: new Date().toISOString(),
  })

  if (error) {
    console.error(`Save failed: ${error.message}`)
    process.exit(1)
  }
  console.log(`\n✅ Saved weekly blog draft for ${target.name} (status: needs_review)`)
  console.log(`   Title: ${parsed.title}`)
  console.log(`   Slug:  ${parsed.slug}`)
  console.log(`   Words: ~${body.split(/\s+/).length}`)
  console.log(`   Review at /approvals — approve, then publish manually.`)
}

main().catch(e => { console.error('FATAL:', e); process.exit(1) })
