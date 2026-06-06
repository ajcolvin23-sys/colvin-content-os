#!/usr/bin/env ts-node
/**
 * gen-colvin-infographic.ts — Colvin Enterprises single-image LinkedIn INFOGRAPHIC.
 * Generates a navy+gold portrait poster (like the "7 AI Agents" example), renders it
 * to a real PNG via Playwright, and returns the paths. A topic-history guard makes
 * every run a DIFFERENT topic from recent days (never the same image twice).
 *
 * Exported for the daily run; also runnable standalone (DRY RUN, saves no DB rows):
 *   npm run colvin:infographic
 */
import * as fs from 'fs'
import * as path from 'path'
import { chromium } from '@playwright/test'
import { callClaudeJSON } from '../../lib/ai/claude'

const ROOT = path.resolve(__dirname, '../..')

function loadEnv() {
  const envPath = path.join(ROOT, '.env.local')
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim(); if (!t || t.startsWith('#')) continue
    const i = t.indexOf('='); if (i < 0) continue
    const k = t.slice(0, i).trim(), v = t.slice(i + 1).trim()
    if (!process.env[k]) process.env[k] = v
  }
}

// ── Brand ──────────────────────────────────────────────────────────────────
const NAVY = '#0A1A2F', NAVY2 = '#0E2038', GOLD = '#C9A227', INK = '#0A1A2F'
const WEBSITE = 'colvinenterprise.info'
const HISTORY_PATH = path.join(ROOT, 'automation-os/data/colvin-infographic-history.json')

// Brand logo. Drop the gold CE logo here and it gets embedded in both brand spots.
// Falls back to a CSS "CE" monogram if the file is absent.
const LOGO_PATH = path.join(ROOT, 'automation-os/assets/colvin-logo.png')
function logoDataUri(): string | null {
  try {
    const buf = fs.readFileSync(LOGO_PATH)
    const ext = path.extname(LOGO_PATH).slice(1).toLowerCase() || 'png'
    return `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${buf.toString('base64')}`
  } catch { return null }
}

// ── Inline line-icon set (stroke = currentColor) ─────────────────────────────
const ICONS: Record<string, string> = {
  funnel: '<path d="M3 4h18l-7 8v6l-4 2v-8z"/>',
  calendar: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  megaphone: '<path d="M3 11v2l11 5V6L3 11zM14 8a4 4 0 010 8M5 13v5h3v-4"/>',
  document: '<path d="M6 2h8l4 4v16H6zM14 2v4h4M9 13h6M9 17h6"/>',
  brain: '<path d="M9 3a3 3 0 00-3 3 3 3 0 00-1 5 3 3 0 002 5 3 3 0 005 1V4a3 3 0 00-3-1zM15 3a3 3 0 013 3 3 3 0 011 5 3 3 0 01-2 5 3 3 0 01-5 1"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>',
  rocket: '<path d="M12 3c4 2 6 6 6 11l-3 2-3-2-3 2-3-2c0-5 2-9 6-11zM12 9a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 00-3 11v2h6v-2a6 6 0 00-3-11z"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0112 0M16 6a3 3 0 010 6M21 20a6 6 0 00-5-5.9"/>',
  dollar: '<circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.5a2.5 2 0 012.5-1.5c1.4 0 2.5.7 2.5 2s-1 1.7-2.5 2-2.5.7-2.5 2 1.1 2 2.5 2a2.5 2 0 002.5-1.5"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
}
const CHECK = '<path d="M5 12l4 4 10-10"/>'
function iconFor(title: string): string {
  const t = title.toLowerCase()
  const map: [RegExp, string][] = [
    [/captur|lead|funnel|intake/, 'funnel'], [/appoint|calendar|schedul|book|meeting/, 'calendar'],
    [/follow|email|message|text|nurtur|outreach|re-?engag/, 'mail'], [/crm|data|insight|analy|track|intel|report|dashboard|kpi/, 'chart'],
    [/market|content|campaign|social|brand/, 'megaphone'], [/document|onboard|file|contract|proposal/, 'document'],
    [/ceo|advisor|strategy|brain|decision|think|intelligence/, 'brain'], [/target|prospect|acqui|qualif/, 'target'],
    [/grow|scale|launch|revenue/, 'rocket'], [/idea|automat|workflow|process/, 'gear'],
    [/team|client|member|congreg|donor|volunteer|retention|relationship/, 'users'], [/money|financ|giving|payment|invoice|billing/, 'dollar'],
    [/secur|complian|protect|risk|trust/, 'shield'], [/time|hour|speed|fast|24\/7/, 'clock'],
  ]
  for (const [re, k] of map) if (re.test(t)) return ICONS[k]
  return ICONS.bulb
}
const svg = (paths: string, size = 30, color = GOLD) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="${color}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`

export interface InfographicItem { title: string; highlight: string; desc: string; bullets: string[]; outcome: string }
export interface Infographic {
  topic_id: string
  title_line1: string; title_line2: string; title_highlights: string[]; subtitle: string
  items: InfographicItem[]; banner: string; banner_highlight: string; tagline: string; services: string[]
  caption: string; hashtags: string[]
}

function readHistory(): Array<{ date: string; topic_id: string; title: string }> {
  try { return JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf8')) } catch { return [] }
}
function appendHistory(entry: { date: string; topic_id: string; title: string }) {
  const hist = readHistory()
  hist.push(entry)
  fs.mkdirSync(path.dirname(HISTORY_PATH), { recursive: true })
  fs.writeFileSync(HISTORY_PATH, JSON.stringify(hist.slice(-60), null, 2)) // keep last 60
}

function buildSystem(cta: string, recent: string[]): string {
  const avoid = recent.length
    ? `\n\nAVOID these recently-used topics (pick a genuinely DIFFERENT angle/framework — do not repeat the theme or the same 7 items):\n${recent.map(t => `- ${t}`).join('\n')}`
    : ''
  return `You are an elite information designer for Colvin Enterprises (Alfred Colvin, Indianapolis AI consultant).
Design the CONTENT for ONE highly shareable LinkedIn INFOGRAPHIC poster (single tall image, NOT a carousel, NOT video).
Audience: churches, nonprofits, financial advisors, insurance agents, small & local service businesses.
It must teach a clear FRAMEWORK with exactly 7 numbered items, look authoritative (HBR/McKinsey/OpenAI quality), and drive a free workflow audit.
EVIDENCE: no fabricated clients, revenue, or ROI. No hype. Practical and concrete.

Choose a FRESH topic from Alfred's pillars each time — e.g. AI agents a business needs, automations for churches, the nonprofit AI stack, advisor workflow automations, lead-gen systems, CRM mistakes, AI tools comparison, the "AI operating system" for a small business, signs you need automation, the AI adoption roadmap, etc. Vary the framing day to day.${avoid}

Return ONLY JSON:
{
  "topic_id": string,               // short kebab-case id of the theme, e.g. "7-ai-agents-smb" or "church-automation-stack"
  "title_line1": string,            // e.g. "THE 7 AI AGENTS"
  "title_line2": string,            // e.g. "EVERY SMALL BUSINESS NEEDS IN 2026"
  "title_highlights": string[],     // words/numbers in the title to color gold
  "subtitle": string,               // one line under the title
  "items": [ { "title": string, "highlight": string, "desc": string, "bullets": string[], "outcome": string } ],  // EXACTLY 7
  "banner": string,                 // bold bottom statement
  "banner_highlight": string,       // 1-2 words within banner to color gold
  "tagline": string,                // footer tagline
  "services": string[],             // 4 short footer services
  "caption": string,                // ready-to-post LinkedIn caption (hook, value, CTA)
  "hashtags": string[]              // 3-5 hashtags
}
Rules per item: title = 2-3 words (the noun to gold-highlight is "highlight", usually the last word); desc = 1-2 short sentences; bullets = 3-4 short items (2-3 words each); outcome = 2 very short benefit phrases joined by " ".
CTA context: "${cta}".`
}

function render(info: Infographic): string {
  const hl = (text: string, words: string[]) => {
    let out = text
    for (const w of words) if (w) out = out.replace(new RegExp(`\\b(${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'g'), `<span class="g">$1</span>`)
    return out
  }
  const logo = logoDataUri()
  const topBrand = logo
    ? `<img class="logoimg" src="${logo}" alt="CE"/>`
    : `<div class="mono">CE</div>`
  const footBrand = logo
    ? `<img class="flogoimg" src="${logo}" alt="CE"/>`
    : `<div class="fmono">CE</div>`
  const rows = info.items.slice(0, 7).map((it, i) => `
    <div class="row">
      <div class="num">${String(i + 1).padStart(2, '0')}</div>
      <div class="ic">${svg(iconFor(it.title + ' ' + it.highlight), 34)}</div>
      <div class="main">
        <div class="rt">${it.title.replace(new RegExp(`(${it.highlight})$`, 'i'), '<span class="g">$1</span>')}</div>
        <div class="rd">${it.desc}</div>
      </div>
      <div class="chk">${it.bullets.slice(0, 4).map(b => `<div><span class="dot">${svg(CHECK, 14, GOLD)}</span>${b}</div>`).join('')}</div>
      <div class="out">${it.outcome}</div>
    </div>`).join('')

  return `<!doctype html><html><head><meta charset="utf-8"><style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap');
    *{margin:0;box-sizing:border-box;font-family:Montserrat,Arial,sans-serif}
    .poster{width:1024px;background:#fff;color:${INK}}
    .hero{background:linear-gradient(135deg,${NAVY},${NAVY2});padding:38px 44px 30px;position:relative;overflow:hidden}
    .hero:before{content:"";position:absolute;top:-40px;right:-40px;width:180px;height:180px;border:2px solid ${GOLD};opacity:.12;border-radius:50%}
    .brandtop{display:flex;align-items:center;gap:14px;margin-bottom:18px}
    .mono{font-family:Georgia,serif;font-weight:700;color:${GOLD};font-size:40px;border:3px solid ${GOLD};border-radius:10px;padding:2px 12px;letter-spacing:-2px}
    .logoimg{height:64px;width:auto;display:block}
    .flogoimg{height:92px;width:auto;display:block}
    .bname{color:#fff;font-weight:800;font-size:22px;letter-spacing:2px;line-height:1}
    .bname small{display:block;color:${GOLD};font-size:12px;letter-spacing:6px;font-weight:600}
    h1{color:#fff;font-size:52px;font-weight:900;line-height:1.02;letter-spacing:-1px;text-transform:uppercase}
    h1 .g,.g{color:${GOLD}}
    .sub{color:#cdd6e3;font-size:18px;font-weight:500;margin-top:14px}
    .body{padding:26px 40px 10px;background:#fff}
    .row{display:grid;grid-template-columns:64px 70px 1.35fr 1fr 0.85fr;align-items:center;gap:6px;background:#f5f7fa;border-radius:14px;padding:14px 16px;margin-bottom:14px;border-left:5px solid ${GOLD}}
    .num{font-size:38px;font-weight:900;color:${GOLD};background:${NAVY};border-radius:10px;height:58px;display:flex;align-items:center;justify-content:center}
    .ic{display:flex;align-items:center;justify-content:center}
    .rt{font-size:21px;font-weight:800;text-transform:uppercase;color:${INK};line-height:1.05}
    .rd{font-size:13.5px;color:#3c4a5c;margin-top:5px;line-height:1.35}
    .chk div{display:flex;align-items:center;gap:7px;font-size:13px;color:#26415c;font-weight:600;margin:3px 0}
    .chk .dot{display:flex}
    .out{font-size:15px;font-weight:800;color:${INK};line-height:1.25;text-align:left;padding-left:8px;border-left:1px solid #d8dee7}
    .banner{margin:8px 40px 0;background:linear-gradient(135deg,${NAVY},${NAVY2});color:#fff;border-radius:14px;padding:22px 26px;text-align:center;font-size:22px;font-weight:800;text-transform:uppercase;line-height:1.25}
    .footer{margin-top:18px;background:linear-gradient(135deg,${NAVY},${NAVY2});padding:26px 40px;display:grid;grid-template-columns:auto 1.2fr 1fr;gap:22px;align-items:center}
    .fmono{font-family:Georgia,serif;color:${GOLD};font-weight:700;font-size:64px;letter-spacing:-4px}
    .fname{color:#fff;font-weight:800;font-size:30px;letter-spacing:1px}.fname small{display:block;color:${GOLD};font-size:13px;letter-spacing:7px}
    .ftag{color:#cdd6e3;font-size:14px;font-weight:600;border-left:2px solid ${GOLD};padding-left:16px;line-height:1.4}
    .fserv div{color:#fff;font-size:14px;font-weight:700;letter-spacing:1px;margin:5px 0;display:flex;gap:8px;align-items:center}
    .strip{background:${GOLD};color:${NAVY};font-weight:800;letter-spacing:1px;font-size:14px;padding:10px 40px;display:flex;justify-content:space-between}
  </style></head><body>
  <div class="poster">
    <div class="hero">
      <div class="brandtop">${topBrand}<div class="bname">COLVIN<small>ENTERPRISES</small></div></div>
      <h1>${hl(info.title_line1, info.title_highlights)}<br>${hl(info.title_line2, info.title_highlights)}</h1>
      <div class="sub">${info.subtitle}</div>
    </div>
    <div class="body">${rows}</div>
    <div class="banner">${info.banner.replace(new RegExp(`(${info.banner_highlight})`, 'i'), '<span class="g">$1</span>')}</div>
    <div class="footer">
      ${footBrand}
      <div><div class="fname">COLVIN<small>ENTERPRISES</small></div><div class="ftag">${info.tagline}</div></div>
      <div class="fserv">${(info.services ?? []).map(sv => `<div>${svg(ICONS.gear, 16)} ${sv}</div>`).join('')}</div>
    </div>
    <div class="strip"><span>🌐 ${WEBSITE}</span><span>${(info.services ?? []).join('  •  ')}</span></div>
  </div></body></html>`
}

export interface InfographicResult { info: Infographic; pngPath: string; htmlPath: string; jsonPath: string }

/**
 * Generate today's Colvin infographic (fresh topic vs recent history), render to PNG.
 * Caller must have env loaded (ANTHROPIC_API_KEY). Appends to the topic history file.
 */
export async function generateColvinInfographic(opts: {
  model: string; cta: string; dateStr: string; outDir: string; recordHistory?: boolean
}): Promise<InfographicResult> {
  const recent = readHistory().slice(-14).map(h => h.title)
  const { json: info } = await callClaudeJSON<Infographic>({
    taskType: 'content_generation',
    system: buildSystem(opts.cta, recent),
    user: `Design today's Colvin Enterprises LinkedIn infographic (${opts.dateStr}). Exactly 7 numbered items. A FRESH topic different from recent days. Authoritative, practical, no fabricated proof.`,
    modelOverride: opts.model, maxTokensOverride: 4000,
  })

  fs.mkdirSync(opts.outDir, { recursive: true })
  const stamp = `${opts.dateStr}-${Date.now().toString().slice(-5)}`
  const htmlPath = path.join(opts.outDir, `colvin-infographic-${stamp}.html`)
  const pngPath = path.join(opts.outDir, `colvin-infographic-${stamp}.png`)
  const jsonPath = path.join(opts.outDir, `colvin-infographic-${stamp}.json`)
  fs.writeFileSync(htmlPath, render(info))
  fs.writeFileSync(jsonPath, JSON.stringify(info, null, 2))

  const browser = await chromium.launch()
  try {
    const page = await browser.newPage({ viewport: { width: 1024, height: 1600 }, deviceScaleFactor: 2 })
    await page.goto('file://' + htmlPath)
    await page.waitForTimeout(600)
    await page.locator('.poster').screenshot({ path: pngPath })
  } finally {
    await browser.close()
  }

  if (opts.recordHistory !== false) {
    appendHistory({ date: opts.dateStr, topic_id: info.topic_id || 'unknown', title: `${info.title_line1} ${info.title_line2}`.trim() })
  }
  return { info, pngPath, htmlPath, jsonPath }
}

// ── Standalone CLI (DRY RUN) ─────────────────────────────────────────────────
async function main() {
  loadEnv()
  const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'automation-os/config/gabriel-config.json'), 'utf8'))
  const TODAY = new Date().toISOString().slice(0, 10)
  const model: string = cfg.model_routing.content_generation
  const cta: string = cfg.lane_strategy.colvin_enterprises.cta
  console.log(`\n🎨 Colvin Infographic — DRY RUN (${TODAY}) · model ${model}`)
  const recent = readHistory().slice(-14).map(h => h.title)
  if (recent.length) console.log(`   Avoiding ${recent.length} recent topic(s).`)
  const { info, pngPath, htmlPath } = await generateColvinInfographic({
    model, cta, dateStr: TODAY, outDir: path.join(ROOT, 'out', 'colvin-previews'),
  })
  console.log(`\nTopic: ${info.title_line1} ${info.title_line2}`)
  info.items.slice(0, 7).forEach((it, i) => console.log(`  ${i + 1}. ${it.title} — ${it.outcome}`))
  console.log(`\n🖼  PNG: ${pngPath}`)
  console.log(`   HTML: ${htmlPath}\n(DRY RUN — nothing saved to DB/queue.)\n`)
}

if (require.main === module) main().catch(e => { console.error('FATAL:', e); process.exit(1) })
