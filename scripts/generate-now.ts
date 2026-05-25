#!/usr/bin/env ts-node
// ─────────────────────────────────────────────────────────────────────────────
// scripts/generate-now.ts
// One-shot: generate content via OpenAI → save to Supabase → render → upload → notify
// Run: npx ts-node --project remotion/tsconfig.json scripts/generate-now.ts
// ─────────────────────────────────────────────────────────────────────────────

import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import * as https from 'https'

// ── Load .env.local ───────────────────────────────────────────────────────────
const envPath = path.resolve(__dirname, '../.env.local')
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx < 0) continue
    const key = trimmed.slice(0, idx).trim()
    const val = trimmed.slice(idx + 1).trim()
    if (!process.env[key]) process.env[key] = val
  }
}

// ── Config ────────────────────────────────────────────────────────────────────
const ROOT = path.resolve(__dirname, '..')
const OUT_DIR = path.join(ROOT, 'out')
const REMOTION_ENTRY = path.join(ROOT, 'remotion', 'index.ts')
const REMOTION_TSCONFIG = path.join(ROOT, 'remotion', 'tsconfig.json')

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iuzlbtfevzkerehmluqj.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8894079838:AAGFiT-sRdyFXuBbscTklm7TmsGi6XWjXdc'
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '6728929805'
// Composio/Drive no longer required — videos delivered via Telegram sendDocument

function log(msg: string) {
  console.log(`[generate-now] ${new Date().toISOString().slice(11,19)} — ${msg}`)
}

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function httpPost(url: string, body: unknown, headers: Record<string, string> = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body)
    const urlObj = new URL(url)
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        ...headers,
      },
    }
    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => resolve(data))
    })
    req.on('error', reject)
    req.write(payload)
    req.end()
  })
}

function httpPatch(url: string, body: unknown, headers: Record<string, string> = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body)
    const urlObj = new URL(url)
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        ...headers,
      },
    }
    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => resolve(data))
    })
    req.on('error', reject)
    req.write(payload)
    req.end()
  })
}

// ── Step 1: Generate content via OpenAI ───────────────────────────────────────
async function generateContent(dateStr: string) {
  log('Calling GPT-4o to research viral topic and generate slides...')

  const today = new Date(dateStr)
  const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' })
  const month = today.toLocaleDateString('en-US', { month: 'long' })

  const prompt = `You are Gabriel — a viral content strategist for First Keys Indy, a Black-owned real estate education brand in Indianapolis.

Today is ${dayOfWeek}, ${month} ${today.getDate()}, ${today.getFullYear()}.

Brand: First Keys Indy — Tanya Day, Broker/Owner, Elite Realty & Development
Phone: 317-995-4719 | Website: FirstKeysIndy.org
Audience: Black Indianapolis families who've been locked out of homeownership
Tone: Direct, truth-telling, hopeful, community-rooted. Short sentences. Mobile-first. No fluff.

COMPLIANCE RULES:
- Never state exact dollar amounts as guaranteed — always say "up to $X" or "may qualify for"
- Always include: "Eligibility depends on your situation"
- Never make legal claims or promises about loan approval

Generate a viral-optimized TikTok/Instagram Reel storytelling slideshow.

Choose a topic that addresses a real fear, myth, or barrier that stops Black families from buying homes. Topics that go viral: "they don't tell you this," hidden fees, credit myths, program secrets, systemic barriers explained simply, first-gen homebuyer stories.

Slide structure (8-9 slides):
1. Hook slide: Stops the scroll (3.5s)
2. Problem/history: Why this is real (4s)
3. The specific barrier or truth (4s)
4. The turn: "But here's what changed" (3.5s)
5. Solution/program: What's available (4s)
6. Specific resource: Verified program or step (4s)
7. Action: What to do right now (3.5s)
8. Brand CTA: FirstKeysIndy.org (3.5s)
9. Contact: 317-995-4719 (3s)

Respond ONLY with valid JSON:
{
  "topic": "Short topic name (5-10 words)",
  "angle": "What makes this stop the scroll",
  "slides": [
    {
      "eyebrow": "LABEL IN CAPS or null",
      "headline": "Big punchy text. Use \\n for line breaks. Max 6 words per line.",
      "sub": "1-2 supporting sentences or null",
      "bg": "#0A0A0A",
      "accentColor": "#C9A84C",
      "align": "left",
      "durationSeconds": 3.5
    }
  ],
  "caption": "TikTok/IG caption — hook first, CTA last. Under 200 chars.",
  "hashtags": ["firstkeysindy", "indianapolishomebuyer", "blackhomeownership", "indyhomes", "firsttimehomebuyer"],
  "tiktokSound": "e.g. ambient lo-fi beat or emotional piano instrumental"
}`

  const payload = {
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.85,
  }

  const raw = await httpPost(
    'https://api.openai.com/v1/chat/completions',
    payload,
    { Authorization: `Bearer ${OPENAI_API_KEY}` }
  )

  const response = JSON.parse(raw)
  if (response.error) throw new Error(`OpenAI error: ${response.error.message}`)

  const content = JSON.parse(response.choices[0].message.content)
  log(`Topic: "${content.topic}"`)
  log(`Angle: "${content.angle}"`)
  log(`Slides: ${content.slides.length}`)
  return content
}

// ── Step 2: Convert to Remotion slide format ──────────────────────────────────
function buildSlides(content: any) {
  const FPS = 30
  let currentFrame = 0
  const slides = []

  for (const s of content.slides) {
    const durationInFrames = Math.round((s.durationSeconds || 4) * FPS)
    slides.push({
      from: currentFrame,
      durationInFrames,
      bg: s.bg || '#0A0A0A',
      eyebrow: s.eyebrow || undefined,
      headline: s.headline,
      sub: s.sub || undefined,
      accentColor: s.accentColor || '#C9A84C',
      align: s.align as 'left' | 'center',
    })
    currentFrame += durationInFrames
  }

  return { slides, totalFrames: currentFrame }
}

// ── Step 3: Save to Supabase ──────────────────────────────────────────────────
async function saveToSupabase(content: any, slides: any[], totalFrames: number, dateStr: string) {
  log('Saving to Supabase...')

  const raw = await httpPost(
    `${SUPABASE_URL}/rest/v1/video_projects`,
    {
      title: `[First Keys Indy Daily] ${content.topic} — ${dateStr}`,
      lane: 'first_keys_indy',
      platform: 'tiktok',
      aspect_ratio: '9:16',
      render_status: 'content_ready',
      voiceover_script: content.caption,
      render_settings: {
        slides, totalFrames,
        topic: content.topic,
        angle: content.angle,
        caption: content.caption,
        hashtags: content.hashtags,
        tiktokSound: content.tiktokSound,
        date: dateStr,
      },
    },
    {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      Prefer: 'return=representation',
    }
  )

  const rows = JSON.parse(raw)
  const project = Array.isArray(rows) ? rows[0] : rows
  log(`Saved project: ${project.id}`)
  return project
}

// ── Step 4: Render video ──────────────────────────────────────────────────────
function renderVideo(slides: any[], compositionId: string, outputFile: string, totalFrames: number) {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })
  log(`Rendering ${compositionId} (${totalFrames} frames = ${(totalFrames/30).toFixed(1)}s) → ${path.basename(outputFile)}`)

  // Write slides to a temp JSON file (avoids shell escaping issues)
  const propsFile = path.join(OUT_DIR, `props-${Date.now()}.json`)
  fs.writeFileSync(propsFile, JSON.stringify({ slides }))

  try {
    const cmd = [
      'npx remotion render',
      `"${REMOTION_ENTRY}"`,
      compositionId,
      `"${outputFile}"`,
      `--config="${REMOTION_TSCONFIG}"`,
      `--props="${propsFile}"`,
      '--log=error',
    ].join(' ')

    execSync(cmd, { stdio: 'inherit', cwd: ROOT })
  } finally {
    if (fs.existsSync(propsFile)) fs.unlinkSync(propsFile)
  }

  const sizeMB = (fs.statSync(outputFile).size / 1024 / 1024).toFixed(1)
  log(`Done: ${path.basename(outputFile)} (${sizeMB}MB)`)
}

// ── Step 5: Send video file directly via Telegram ────────────────────────────
// Videos are sent as document attachments — Alfred receives them on his phone
// and can drag-and-drop straight to TikTok/IG/FB
async function sendVideoToTelegram(filePath: string, caption: string): Promise<void> {
  log(`Sending ${path.basename(filePath)} to Telegram...`)
  const sizeMB = (fs.statSync(filePath).size / 1024 / 1024).toFixed(1)
  log(`File size: ${sizeMB}MB`)

  return new Promise((resolve, reject) => {
    const fileBuffer = fs.readFileSync(filePath)
    const fileName = path.basename(filePath)
    const boundary = `----FormBoundary${Date.now().toString(16)}`

    // Build multipart/form-data body
    const parts: Buffer[] = []
    const addField = (name: string, value: string) => {
      parts.push(Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`
      ))
    }
    addField('chat_id', TELEGRAM_CHAT_ID)
    addField('caption', caption)
    addField('parse_mode', 'HTML')

    parts.push(Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="document"; filename="${fileName}"\r\nContent-Type: video/mp4\r\n\r\n`
    ))
    parts.push(fileBuffer)
    parts.push(Buffer.from(`\r\n--${boundary}--\r\n`))

    const body = Buffer.concat(parts)
    const urlObj = new URL(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`)

    const req = https.request({
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
      },
    }, (res) => {
      let data = ''
      res.on('data', (chunk) => data += chunk)
      res.on('end', () => {
        try {
          const result = JSON.parse(data)
          if (result.ok) {
            log(`Video delivered to Telegram ✓`)
            resolve()
          } else {
            log(`Telegram sendDocument warning: ${JSON.stringify(result).slice(0, 200)}`)
            resolve() // non-fatal — text notification still sent
          }
        } catch {
          resolve()
        }
      })
    })
    req.on('error', (err) => {
      log(`Telegram file send warning: ${err}`)
      resolve() // non-fatal
    })
    req.write(body)
    req.end()
  })
}

// ── Step 6: Copy to first-keys-indy website ───────────────────────────────────
function copyToWebsite(verticalFile: string, squareFile: string) {
  const publicDir = path.join(ROOT, '..', 'first-keys-indy', 'public', 'daily')
  if (!fs.existsSync(path.join(ROOT, '..', 'first-keys-indy'))) return
  try {
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true })
    fs.copyFileSync(verticalFile, path.join(publicDir, 'latest-vertical.mp4'))
    fs.copyFileSync(squareFile, path.join(publicDir, 'latest-square.mp4'))
    log('Copied to first-keys-indy/public/daily/')
  } catch (err) {
    log(`Copy warning: ${err}`)
  }
}

// ── Step 7: Send Telegram notification ────────────────────────────────────────
async function sendTelegram(message: string) {
  log('Sending Telegram notification...')
  try {
    await httpPost(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      { chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'HTML', disable_web_page_preview: false }
    )
    log('Telegram sent ✓')
  } catch (err) {
    log(`Telegram warning: ${err}`)
  }
}

// ── Step 8: Update Supabase status ────────────────────────────────────────────
async function updateStatus(projectId: string, updates: Record<string, unknown>) {
  await httpPatch(
    `${SUPABASE_URL}/rest/v1/video_projects?id=eq.${projectId}`,
    updates,
    {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      Prefer: 'return=minimal',
    }
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🎬  First Keys Indy — Daily Video Generator\n')

  const dateStr = new Date().toISOString().split('T')[0]
  const dateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  })

  // 1. Generate
  const content = await generateContent(dateStr)
  const { slides, totalFrames } = buildSlides(content)

  // 2. Save to Supabase
  const project = await saveToSupabase(content, slides, totalFrames, dateStr)

  // 3. Render
  const verticalFile = path.join(OUT_DIR, `daily-vertical-${dateStr}.mp4`)
  const squareFile = path.join(OUT_DIR, `daily-square-${dateStr}.mp4`)

  log('Starting render — this takes 1-3 minutes...')
  renderVideo(slides, 'DailyVideo-Vertical', verticalFile, totalFrames)
  renderVideo(slides, 'DailyVideo-Square', squareFile, totalFrames)

  // 4. Copy to website
  copyToWebsite(verticalFile, squareFile)

  // 5. Send text notification first
  const hashtagStr = (content.hashtags || []).map((h: string) => `#${h}`).join(' ')
  const message = [
    `🎬 <b>Daily Video Ready — ${dateFormatted}</b>`,
    ``,
    `🎯 <b>Topic:</b> ${content.topic}`,
    `⚡ <b>Angle:</b> ${content.angle}`,
    ``,
    `📱 <b>Caption (paste this):</b>`,
    content.caption,
    ``,
    `🏷 ${hashtagStr}`,
    content.tiktokSound ? `🎵 <b>Sound:</b> ${content.tiktokSound}` : '',
    ``,
    `📎 <b>Videos coming next — save them to post!</b>`,
    `▶ Vertical = TikTok / Reels`,
    `▶ Square = Facebook / IG Feed`,
    ``,
    `✅ Drag and drop to post!`,
  ].filter(Boolean).join('\n')

  await sendTelegram(message)

  // 6. Send video files directly to Telegram — Alfred gets them on his phone
  const verticalCaption = `📱 <b>VERTICAL</b> — TikTok / Reels\n${content.topic} (${dateStr})`
  const squareCaption = `⬛ <b>SQUARE</b> — Facebook / IG Feed\n${content.topic} (${dateStr})`
  await sendVideoToTelegram(verticalFile, verticalCaption)
  await sendVideoToTelegram(squareFile, squareCaption)

  const verticalUrl = 'Delivered via Telegram ✓'
  const squareUrl = 'Delivered via Telegram ✓'

  // 7. Update Supabase
  await updateStatus(project.id, {
    render_status: 'rendered',
    updated_at: new Date().toISOString(),
    render_settings: {
      ...project.render_settings,
      vertical_url: verticalUrl,
      square_url: squareUrl,
      rendered_at: new Date().toISOString(),
    },
  })

  console.log('\n' + '─'.repeat(60))
  console.log(`✅  Done!`)
  console.log(`📌  Topic: ${content.topic}`)
  console.log(`📁  Vertical: ${verticalFile}`)
  console.log(`📁  Square:   ${squareFile}`)
  console.log(`📲  Drive (Vertical): ${verticalUrl}`)
  console.log(`📲  Drive (Square):   ${squareUrl}`)
  console.log(`📬  Telegram notification sent to Alfred`)
  console.log('─'.repeat(60) + '\n')
}

main().catch((err) => {
  console.error('\n❌  FATAL:', err)
  process.exit(1)
})
