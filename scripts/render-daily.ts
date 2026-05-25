#!/usr/bin/env ts-node
// ─────────────────────────────────────────────────────────────────────────────
// scripts/render-daily.ts
//
// Daily First Keys Indy video render pipeline:
//   1. Fetch today's generated slide content from Supabase / API
//   2. Render vertical + square MP4 via Remotion CLI
//   3. Upload both to Google Drive via Composio
//   4. Send Telegram notification to Alfred
//   5. Update Supabase render_status to 'rendered'
//
// Run: npx ts-node --project remotion/tsconfig.json scripts/render-daily.ts
// Or via GitHub Actions: .github/workflows/daily-video.yml
// ─────────────────────────────────────────────────────────────────────────────

import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import * as https from 'https'

// ── Config ────────────────────────────────────────────────────────────────────
const ROOT = path.resolve(__dirname, '..')
const OUT_DIR = path.join(ROOT, 'out')
const REMOTION_ENTRY = path.join(ROOT, 'remotion', 'index.ts')
const REMOTION_TSCONFIG = path.join(ROOT, 'remotion', 'tsconfig.json')

// Required env vars
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iuzlbtfevzkerehmluqj.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8894079838:AAGFiT-sRdyFXuBbscTklm7TmsGi6XWjXdc'
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '6728929805'
const COMPOSIO_API_KEY = process.env.COMPOSIO_API_KEY || 'ak_hIyzBFpeCSllvEQrqPOt'
const GOOGLE_DRIVE_FOLDER = process.env.GOOGLE_DRIVE_FOLDER_ID || ''

// ── Helpers ───────────────────────────────────────────────────────────────────
function log(msg: string) {
  console.log(`[render-daily] ${new Date().toISOString()} — ${msg}`)
}

function httpGet(url: string, headers: Record<string, string> = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    const options = {
      headers: { 'Content-Type': 'application/json', ...headers },
    }
    https.get(url, options, (res) => {
      let data = ''
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => resolve(data))
      res.on('error', reject)
    }).on('error', reject)
  })
}

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

// ── Step 1: Fetch today's content from Supabase ────────────────────────────────
async function fetchTodayContent() {
  const dateStr = new Date().toISOString().split('T')[0]
  log(`Fetching content for ${dateStr}...`)

  const url = `${SUPABASE_URL}/rest/v1/video_projects?lane=eq.first_keys_indy&created_at=gte.${dateStr}T00:00:00Z&order=created_at.desc&limit=1`
  const raw = await httpGet(url, {
    apikey: SUPABASE_SERVICE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
  })

  const rows = JSON.parse(raw)
  if (!rows || rows.length === 0) {
    throw new Error(`No daily content found for ${dateStr}. Run the /api/daily-video endpoint first.`)
  }

  const project = rows[0]
  const settings = project.render_settings
  log(`Found project ${project.id}: ${settings.topic}`)
  return project
}

// ── Step 2: Render via Remotion CLI ───────────────────────────────────────────
function renderVideo(
  slides: unknown[],
  compositionId: string,
  outputFile: string,
  totalFrames: number
) {
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

  log(`Rendered: ${path.basename(outputFile)} (${(fs.statSync(outputFile).size / 1024 / 1024).toFixed(1)}MB)`)
}

// ── Step 3: Upload to Google Drive via Composio ──────────────────────────────
async function uploadToDrive(filePath: string, fileName: string): Promise<string> {
  log(`Uploading ${fileName} to Google Drive...`)

  try {
    // Read file as base64
    const fileBuffer = fs.readFileSync(filePath)
    const base64Content = fileBuffer.toString('base64')

    // Use Composio's Google Drive tool
    const response = await httpPost(
      'https://backend.composio.dev/api/v3/actions/GOOGLEDRIVE_UPLOAD_FILE/execute',
      {
        appName: 'googledrive',
        input: {
          name: fileName,
          mimeType: 'video/mp4',
          content: base64Content,
          folderId: GOOGLE_DRIVE_FOLDER || null,
        },
      },
      {
        'X-API-KEY': COMPOSIO_API_KEY,
        'x-composio-api-key': COMPOSIO_API_KEY,
      }
    )

    const result = JSON.parse(response)
    const fileId = result?.data?.id || result?.response?.id || result?.id || 'unknown'
    const driveUrl = `https://drive.google.com/file/d/${fileId}/view`
    log(`Uploaded: ${driveUrl}`)
    return driveUrl
  } catch (err) {
    log(`Drive upload warning: ${err} — continuing without Drive link`)
    return 'https://drive.google.com (upload manually)'
  }
}

// ── Step 4: Send Telegram notification ────────────────────────────────────────
async function sendTelegram(message: string) {
  log('Sending Telegram notification...')
  try {
    await httpPost(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
      }
    )
    log('Telegram sent.')
  } catch (err) {
    log(`Telegram warning: ${err}`)
  }
}

// ── Step 5: Update Supabase render status ─────────────────────────────────────
async function updateRenderStatus(projectId: string, updates: Record<string, unknown>) {
  const url = `${SUPABASE_URL}/rest/v1/video_projects?id=eq.${projectId}`
  await httpPost(url, updates, {
    apikey: SUPABASE_SERVICE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
    Prefer: 'return=minimal',
    'X-HTTP-Method-Override': 'PATCH',
  })
}

// ── Main pipeline ─────────────────────────────────────────────────────────────
async function main() {
  log('=== First Keys Indy Daily Video Render Pipeline ===')

  const dateStr = new Date().toISOString().split('T')[0]
  const dateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  })

  // 1. Fetch content
  const project = await fetchTodayContent()
  const { slides, totalFrames, topic, angle, caption, hashtags, tiktokSound } = project.render_settings

  // 2. Render videos
  const verticalFile = path.join(OUT_DIR, `daily-vertical-${dateStr}.mp4`)
  const squareFile = path.join(OUT_DIR, `daily-square-${dateStr}.mp4`)

  renderVideo(slides, 'DailyVideo-Vertical', verticalFile, totalFrames)
  renderVideo(slides, 'DailyVideo-Square', squareFile, totalFrames)

  // 2b. Copy latest video to first-keys-indy website (auto-updates landing page)
  const firstKeysPublicDir = path.join(ROOT, '..', 'first-keys-indy', 'public', 'daily')
  if (fs.existsSync(path.join(ROOT, '..', 'first-keys-indy'))) {
    try {
      if (!fs.existsSync(firstKeysPublicDir)) fs.mkdirSync(firstKeysPublicDir, { recursive: true })
      fs.copyFileSync(verticalFile, path.join(firstKeysPublicDir, 'latest-vertical.mp4'))
      fs.copyFileSync(squareFile, path.join(firstKeysPublicDir, 'latest-square.mp4'))
      log('Copied latest videos to first-keys-indy/public/daily/')
    } catch (err) {
      log(`Copy warning: ${err}`)
    }
  }

  // 3. Upload to Google Drive
  const [verticalUrl, squareUrl] = await Promise.all([
    uploadToDrive(verticalFile, `[First Keys Indy] ${topic} — Vertical (${dateStr}).mp4`),
    uploadToDrive(squareFile, `[First Keys Indy] ${topic} — Square (${dateStr}).mp4`),
  ])

  // 4. Send Telegram notification
  const captionLines = caption ? caption.split('\n').slice(0, 3).join('\n') : ''
  const hashtagStr = hashtags ? hashtags.map((h: string) => `#${h}`).join(' ') : ''

  const message = [
    `🎬 <b>Daily Video Ready</b>`,
    ``,
    `📅 <b>${dateFormatted}</b>`,
    `🎯 <b>Topic:</b> ${topic}`,
    `⚡ <b>Angle:</b> ${angle}`,
    ``,
    `📱 <b>Caption:</b>`,
    captionLines,
    ``,
    hashtagStr ? `🏷 <b>Hashtags:</b> ${hashtagStr}` : '',
    tiktokSound ? `🎵 <b>Sound:</b> ${tiktokSound}` : '',
    ``,
    `📁 <b>Download Files:</b>`,
    `▶ Vertical (TikTok/Reels): ${verticalUrl}`,
    `▶ Square (FB/IG Feed): ${squareUrl}`,
    ``,
    `🌐 <b>Link:</b> FirstKeysIndy.org`,
    `📞 <b>Phone:</b> 317-995-4719`,
    ``,
    `✅ Drag and drop from Google Drive to post!`,
  ].filter(Boolean).join('\n')

  await sendTelegram(message)

  // 5. Update Supabase
  await updateRenderStatus(project.id, {
    render_status: 'rendered',
    updated_at: new Date().toISOString(),
    render_settings: {
      ...project.render_settings,
      vertical_url: verticalUrl,
      square_url: squareUrl,
      rendered_at: new Date().toISOString(),
    },
  })

  log('=== Pipeline Complete ===')
  log(`Topic: ${topic}`)
  log(`Vertical: ${verticalUrl}`)
  log(`Square: ${squareUrl}`)
  log(`Files saved to: ${OUT_DIR}`)
}

main().catch((err) => {
  console.error('[render-daily] FATAL:', err)
  process.exit(1)
})
