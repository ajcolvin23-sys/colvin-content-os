#!/usr/bin/env ts-node
/**
 * test-colvin-studio.ts — DRY RUN, saves nothing.
 * Generates ONE Colvin Enterprises LinkedIn Visual Studio carousel so Alfred can
 * preview today's deliverable. No DB writes, no other lanes, no review queue.
 *   npm run test:colvin-studio
 */
import * as fs from 'fs'
import * as path from 'path'
import { callClaudeJSON } from '../../lib/ai/claude'

const ROOT = path.resolve(__dirname, '../..')
const envPath = path.join(ROOT, '.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i < 0) continue
    const k = t.slice(0, i).trim(), v = t.slice(i + 1).trim()
    if (!process.env[k]) process.env[k] = v
  }
}

const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'automation-os/config/gabriel-config.json'), 'utf8'))
const strat = cfg.lane_strategy.colvin_enterprises
const TODAY = new Date().toISOString().slice(0, 10)
const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
const hook: string = strat.hooks[dayOfYear % strat.hooks.length]
const cta: string = strat.cta
const ctaLink: string = strat.cta_link ?? ''
const transformation: string = strat.transformation ?? ''
const rungLabel: string = strat.rung_label ?? 'current offer'
const model: string = cfg.model_routing.content_generation

const PILLARS = 'AI Agents, Business Automation, Church Technology, Nonprofit Technology, Financial Advisor Technology, AI Productivity, CRM Systems, AI Workflows, Business Growth Systems, Lead Generation Systems, AI for Ministry, AI for Education, AI Infrastructure, Future of Work, AI Research'

const system = `You are an elite LinkedIn Growth Strategist, Research Analyst, Information Designer, and AI Content Architect for Colvin Enterprises (Alfred Colvin, Indianapolis AI consultant).

Your ONLY output is a HIGHLY SHAREABLE LinkedIn CAROUSEL or INFOGRAPHIC. NEVER video, Reels, or YouTube.
Every piece must look like it belongs on the feeds of Harvard Business Review, McKinsey, OpenAI, Anthropic, HubSpot, or Morning Brew.

AUDIENCE — Primary: churches, nonprofits, financial advisors, insurance agents, small businesses, local service businesses. Secondary: entrepreneurs, coaches, consultants, community orgs.
CONTENT PILLARS (pick one focus): ${PILLARS}.

MANDATORY: teach something, contain a framework, contain a visual, contain practical implementation, contain a CTA, contain a lead-generation angle, deliver business value. No fluff. No motivational filler. No generic AI news. Content people SAVE.

EVIDENCE RULE: Zero fabricated client names, revenue numbers, or invented ROI. Label any outcome as "[example scenario]". Statistics must be plausible and labeled as illustrative if not sourced.

Produce the full studio deliverable in ONE pass:
1. RESEARCH SUMMARY (5-8 bullets). 2. FORMAT CHOICE + why. 3. CONTENT STRUCTURE — Slide 1 Hook, Slides 2-9 Value, final slide CTA. 4. CANVA DESIGN BRIEF. 5. AI IMAGE PROMPT. 6. LINKEDIN CAPTION (Hook, Problem, Insight, Framework, CTA, 3-5 hashtags). 7. ENGAGEMENT ASSETS (10 comments, 5 polls, 5 follow-ups, 5 newsletters). 8. LEAD MAGNET. 9. SELF-SCORE 1-10 on Shareability, Saveability, Authority, Lead Generation, Visual Appeal, Novelty — silently improve until all six are 8+.

Use this exact hook on Slide 1 verbatim: "${hook}"
Tie the CTA to: "${cta}"${ctaLink ? ` (link: ${ctaLink})` : ''}.
Transformation sold: "${transformation}". Current focus: ${rungLabel}.

Return ONLY JSON:
{ "format": string, "format_reason": string, "research_summary": string[],
  "slides": [ { "n": number, "role": "HOOK"|"VALUE"|"CTA", "headline": string, "body": string, "design_note": string } ],
  "canva_brief": { "canvas": string, "typography": string, "palette": string[], "icons": string, "layout": string, "visual_hierarchy": string, "style": string },
  "ai_image_prompt": string, "caption": string, "hashtags": string[],
  "engagement": { "comments": string[], "polls": string[], "followups": string[], "newsletters": string[] },
  "lead_magnet": { "type": string, "title": string, "why_it_converts": string },
  "scores": { "shareability": number, "saveability": number, "authority": number, "lead_generation": number, "visual_appeal": number, "novelty": number } }`

async function main() {
  console.log(`\n🎨 Colvin LinkedIn Visual Studio — DRY RUN (${TODAY})`)
  console.log(`   Model: ${model} | Hook: "${hook}"\n`)
  const { json: p } = await callClaudeJSON<any>({
    taskType: 'content_generation',
    system,
    user: `Create today's Colvin Enterprises LinkedIn visual deliverable (${TODAY}). Pick the highest-leverage pillar for the primary audience. No fabricated proof.`,
    modelOverride: model,
    maxTokensOverride: 8000,
  })
  if (!p) { console.log('✗ No JSON returned.'); return }

  const s = p.scores ?? {}
  const axes = ['shareability', 'saveability', 'authority', 'lead_generation', 'visual_appeal', 'novelty']
  const below = axes.filter(a => (Number(s[a]) || 0) < 8)

  console.log('═'.repeat(64))
  console.log(`FORMAT: ${p.format}  —  ${p.format_reason}`)
  console.log('═'.repeat(64))
  console.log('\n📊 RESEARCH SUMMARY')
  ;(p.research_summary ?? []).forEach((b: string) => console.log(`  • ${b}`))
  console.log('\n🖼  SLIDES')
  ;(p.slides ?? []).forEach((sl: any) => {
    console.log(`\n  [Slide ${sl.n} — ${sl.role}]`)
    console.log(`  ${sl.headline}`)
    if (sl.body) console.log(`  ${sl.body}`)
    console.log(`  💡 ${sl.design_note}`)
  })
  const cb = p.canva_brief ?? {}
  console.log('\n🎨 CANVA BRIEF')
  console.log(`  Canvas: ${cb.canvas}\n  Type: ${cb.typography}\n  Palette: ${(cb.palette ?? []).join(', ')}`)
  console.log(`  Icons: ${cb.icons}\n  Layout: ${cb.layout}\n  Hierarchy: ${cb.visual_hierarchy}\n  Style: ${cb.style}`)
  console.log('\n🤖 AI IMAGE PROMPT\n  ' + (p.ai_image_prompt ?? ''))
  console.log('\n📝 LINKEDIN CAPTION\n' + (p.caption ?? ''))
  console.log('\n  ' + (p.hashtags ?? []).map((h: string) => h.startsWith('#') ? h : `#${h}`).join(' '))
  const eng = p.engagement ?? {}
  console.log('\n💬 ENGAGEMENT ASSETS')
  console.log('  Comments:'); (eng.comments ?? []).forEach((c: string) => console.log(`    • ${c}`))
  console.log('  Polls:'); (eng.polls ?? []).forEach((c: string) => console.log(`    • ${c}`))
  console.log('  Follow-ups:'); (eng.followups ?? []).forEach((c: string) => console.log(`    • ${c}`))
  console.log('  Newsletters:'); (eng.newsletters ?? []).forEach((c: string) => console.log(`    • ${c}`))
  const lm = p.lead_magnet ?? {}
  console.log(`\n🧲 LEAD MAGNET\n  ${lm.type}: ${lm.title}\n  ${lm.why_it_converts}`)
  console.log('\n📈 SCORES')
  axes.forEach(a => console.log(`  ${a.padEnd(16)} ${s[a]}/10`))
  console.log(below.length ? `\n⛔ Would be REJECTED (below 8 on: ${below.join(', ')})` : '\n✅ PASSES the 8+ gate — would be saved as a carousel draft for review.')

  // ── Write a visual HTML preview styled to the Canva brief ──────────────────
  const palette: string[] = (cb.palette ?? []).map((x: string) => (x.match(/#[0-9A-Fa-f]{6}/) || [x])[0])
  const navy = palette.find(c => /#0|#1|#2[0-9A]/.test(c)) || '#0A1628'
  const red = palette.find(c => /C8|#C|#E|#D|#F4/.test(c) && c !== navy) || '#C8102E'
  const esc = (t: string) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const nl2br = (t: string) => esc(t).replace(/\n/g, '<br>')

  const slideCards = (p.slides ?? []).map((sl: any) => {
    const isCTA = sl.role === 'CTA', isHook = sl.role === 'HOOK'
    const bg = isCTA || isHook ? navy : '#F4F6FA'
    const fg = isCTA || isHook ? '#FFFFFF' : navy
    return `<div class="slide" style="background:${bg};color:${fg}">
      <div class="badge" style="background:${red}">Slide ${sl.n} · ${esc(sl.role)}</div>
      <div class="headline" style="font-size:${isHook ? 34 : 26}px">${esc(sl.headline)}</div>
      ${sl.body ? `<div class="body">${nl2br(sl.body)}</div>` : ''}
      <div class="design">🎨 ${esc(sl.design_note)}</div>
    </div>`
  }).join('\n')

  const list = (arr?: string[]) => (arr ?? []).map(x => `<li>${esc(x)}</li>`).join('')
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Colvin Carousel Preview — ${TODAY}</title>
  <style>
    body{margin:0;background:#11161d;font-family:Inter,-apple-system,Segoe UI,Roboto,sans-serif;color:#e7ecf3}
    .wrap{max-width:1180px;margin:0 auto;padding:28px}
    h1{font-size:24px;margin:0 0 4px} .sub{color:#9aa6b6;margin-bottom:22px;font-size:14px}
    .scorebar{display:flex;gap:10px;flex-wrap:wrap;margin:14px 0 26px}
    .pill{background:#1b2531;border:1px solid #2a3644;border-radius:20px;padding:6px 12px;font-size:13px}
    .pill b{color:#5eead4}
    .deck{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:18px}
    .slide{aspect-ratio:1/1;border-radius:16px;padding:22px;display:flex;flex-direction:column;box-shadow:0 6px 24px rgba(0,0,0,.35);overflow:hidden}
    .badge{align-self:flex-start;color:#fff;font-size:11px;font-weight:700;letter-spacing:.5px;padding:4px 10px;border-radius:6px;text-transform:uppercase}
    .headline{font-weight:800;line-height:1.18;margin:14px 0 10px}
    .body{font-size:14px;line-height:1.45;opacity:.92;flex:1}
    .design{font-size:11px;opacity:.6;margin-top:10px;border-top:1px dashed rgba(128,128,128,.4);padding-top:8px}
    .section{background:#1b2531;border:1px solid #2a3644;border-radius:14px;padding:20px 24px;margin-top:22px}
    .section h2{margin:0 0 12px;font-size:17px;color:#fff}
    .caption{white-space:pre-wrap;line-height:1.5;font-size:14px}
    .tags{color:#5eead4;margin-top:10px;font-size:13px}
    ul{margin:6px 0 14px;padding-left:20px} li{margin:4px 0;font-size:13px;line-height:1.4}
    .cols{display:grid;grid-template-columns:1fr 1fr;gap:18px}
    .imgprompt{font-family:ui-monospace,Menlo,monospace;font-size:12px;background:#0d1218;padding:12px;border-radius:8px;line-height:1.5;color:#c9d4e2}
    .lm{border-left:3px solid ${red};padding-left:14px}
    @media(max-width:760px){.cols{grid-template-columns:1fr}}
  </style></head><body><div class="wrap">
    <h1>🎨 Colvin Enterprises — LinkedIn ${esc(p.format ?? 'Carousel')}</h1>
    <div class="sub">${TODAY} · ${esc(p.format_reason ?? '')}</div>
    <div class="scorebar">${axes.map(a => `<span class="pill">${a.replace(/_/g, ' ')} <b>${s[a]}/10</b></span>`).join('')}
      <span class="pill" style="border-color:${below.length ? '#7f1d1d' : '#14532d'}">${below.length ? '⛔ rejected' : '✅ passes 8+ gate'}</span></div>
    <div class="deck">${slideCards}</div>

    <div class="section"><h2>📝 LinkedIn Caption</h2><div class="caption">${esc(p.caption ?? '')}</div>
      <div class="tags">${(p.hashtags ?? []).map((h: string) => esc(h.startsWith('#') ? h : '#' + h)).join('  ')}</div></div>

    <div class="section"><h2>🧲 Lead Magnet</h2><div class="lm"><b>${esc(lm.type ?? '')}: ${esc(lm.title ?? '')}</b><br><span style="font-size:13px;opacity:.85">${esc(lm.why_it_converts ?? '')}</span></div></div>

    <div class="cols">
      <div class="section"><h2>🤖 AI Image Prompt</h2><div class="imgprompt">${esc(p.ai_image_prompt ?? '')}</div></div>
      <div class="section"><h2>🎨 Canva Brief</h2>
        <ul><li><b>Canvas:</b> ${esc(cb.canvas ?? '')}</li><li><b>Type:</b> ${esc(cb.typography ?? '')}</li>
        <li><b>Palette:</b> ${esc((cb.palette ?? []).join(', '))}</li><li><b>Icons:</b> ${esc(cb.icons ?? '')}</li>
        <li><b>Layout:</b> ${esc(cb.layout ?? '')}</li><li><b>Style:</b> ${esc(cb.style ?? '')}</li></ul></div>
    </div>

    <div class="section"><h2>💬 Engagement Assets</h2>
      <div class="cols">
        <div><b>10 comments to leave</b><ul>${list(eng.comments)}</ul><b>5 polls</b><ul>${list(eng.polls)}</ul></div>
        <div><b>5 follow-up posts</b><ul>${list(eng.followups)}</ul><b>5 newsletter ideas</b><ul>${list(eng.newsletters)}</ul></div>
      </div></div>
    <div class="sub" style="margin-top:20px">DRY RUN — nothing saved to the database or review queue.</div>
  </div></body></html>`

  const outDir = path.join(ROOT, 'out', 'colvin-previews')
  fs.mkdirSync(outDir, { recursive: true })
  const htmlPath = path.join(outDir, `colvin-carousel-${TODAY}.html`)
  fs.writeFileSync(htmlPath, html)
  fs.writeFileSync(path.join(outDir, `colvin-carousel-${TODAY}.json`), JSON.stringify(p, null, 2))
  console.log(`\n👁  Visual preview written: ${htmlPath}`)
  console.log('   (open it in your browser to see all the slides laid out)\n')
}

main().catch(e => { console.error('FATAL:', e); process.exit(1) })
