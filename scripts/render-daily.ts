#!/usr/bin/env ts-node
/**
 * render-daily.ts
 *
 * Pulls every pending video_project from Supabase (render_status = 'draft'),
 * renders each one through the Remotion VideoEngine, saves the MP4 to out/,
 * then sends a Telegram notification with all the files ready to post.
 *
 * Runs automatically via launchd at 8:30 AM CST (after Gabriel's 7 AM run).
 * Can also be triggered manually: npm run render:daily
 */

import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import * as https from 'https'

// ── Config ────────────────────────────────────────────────────────────────────
const ROOT       = path.resolve(__dirname, '..')
const OUT_DIR    = path.join(ROOT, 'out')
const VIDEOS_DIR = path.join(ROOT, 'videos')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const TELEGRAM_CHAT_ID   = process.env.TELEGRAM_CHAT_ID!

const FORMAT_TO_COMPOSITION: Record<string, string> = {
  '9:16': 'VideoEngine-Vertical',
  '1:1':  'VideoEngine-Square',
  '16:9': 'VideoEngine-Wide',
}

const LANE_EMOJI: Record<string, string> = {
  colvin_enterprises:   '⚡',
  music_theory_secrets: '🎹',
  indiana_backflow:     '💧',
  first_keys_indy:      '🏠',
}

// ── Load .env.local ───────────────────────────────────────────────────────────
const envPath = path.join(ROOT, '.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const idx = t.indexOf('=')
    if (idx < 0) continue
    const k = t.slice(0, idx).trim()
    const v = t.slice(idx + 1).trim()
    if (!process.env[k]) process.env[k] = v
  }
}

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function httpGet(url: string, headers: Record<string, string> = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'Content-Type': 'application/json', ...headers } }, res => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => resolve(data))
      res.on('error', reject)
    }).on('error', reject)
  })
}

function httpPatch(url: string, body: unknown, headers: Record<string, string> = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body)
    const u = new URL(url)
    const req = https.request({
      hostname: u.hostname, path: u.pathname + u.search, method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload), ...headers },
    }, res => { res.resume(); res.on('end', resolve) })
    req.on('error', reject)
    req.write(payload)
    req.end()
  })
}

async function sendTelegram(text: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return
  const payload = JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: 'HTML', disable_web_page_preview: true })
  const u = new URL(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`)
  await new Promise<void>((resolve, reject) => {
    const req = https.request({
      hostname: u.hostname, path: u.pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
    }, res => { res.resume(); res.on('end', resolve) })
    req.on('error', reject)
    req.write(payload)
    req.end()
  })
}

// ── Fetch pending video projects from Supabase ────────────────────────────────
async function fetchPending() {
  const url = `${SUPABASE_URL}/rest/v1/video_projects?render_status=eq.draft&order=created_at.asc&limit=20`
  const raw = await httpGet(url, {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
  })
  return JSON.parse(raw) as Array<{
    id: string
    title: string
    lane: string
    platform: string
    aspect_ratio: string
    render_settings: Record<string, unknown>
  }>
}

// ── Render one video ──────────────────────────────────────────────────────────
function renderVideo(videoScript: Record<string, unknown>, videoId: string): string {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })
  if (!fs.existsSync(VIDEOS_DIR)) fs.mkdirSync(VIDEOS_DIR, { recursive: true })

  const format = (videoScript.render_format as string) || (videoScript.format as string) || '9:16'
  const compositionId = FORMAT_TO_COMPOSITION[format] ?? 'VideoEngine-Vertical'
  const outputFile = path.join(OUT_DIR, `${videoId}.mp4`)
  const propsFile  = path.join(OUT_DIR, `${videoId}-props.json`)

  fs.writeFileSync(propsFile, JSON.stringify({ videoScript }))

  console.log(`  Rendering ${videoId} (${format}) via ${compositionId}...`)

  try {
    execSync(
      `npx remotion render remotion/index.ts ${compositionId} "${outputFile}" --props="${propsFile}" --log=error`,
      { cwd: ROOT, stdio: 'inherit' }
    )
  } finally {
    if (fs.existsSync(propsFile)) fs.unlinkSync(propsFile)
  }

  const mb = fs.existsSync(outputFile)
    ? (fs.statSync(outputFile).size / 1024 / 1024).toFixed(1)
    : '?'
  console.log(`  ✓ ${path.basename(outputFile)} — ${mb} MB`)
  return outputFile
}

// ── Update render status in Supabase ─────────────────────────────────────────
async function markRendered(projectId: string, outputFile: string) {
  await httpPatch(
    `${SUPABASE_URL}/rest/v1/video_projects?id=eq.${projectId}`,
    { render_status: 'rendered', updated_at: new Date().toISOString() },
    { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, Prefer: 'return=minimal' }
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  console.log(`\n╔══════════════════════════════════════════════╗`)
  console.log(`║  Gabriel Video Render — ${today.slice(0,20).padEnd(20)} ║`)
  console.log(`╚══════════════════════════════════════════════╝\n`)

  const pending = await fetchPending()
  if (pending.length === 0) {
    console.log('No pending videos. Gabriel may not have run yet, or all videos are already rendered.')
    return
  }

  console.log(`Found ${pending.length} pending video(s):\n`)
  pending.forEach(p => console.log(`  ${LANE_EMOJI[p.lane] ?? '🎬'} ${p.title}`))
  console.log('')

  const rendered: Array<{ title: string; lane: string; file: string }> = []
  const failed:   Array<{ title: string; error: string }> = []

  for (const project of pending) {
    const videoScript = project.render_settings as Record<string, unknown>
    const videoId = (videoScript.video_id as string) || project.id

    try {
      const outputFile = renderVideo(videoScript, videoId)
      await markRendered(project.id, outputFile)
      rendered.push({ title: project.title, lane: project.lane, file: outputFile })
    } catch (err) {
      console.error(`  ✗ ${project.title}: ${String(err).slice(0, 100)}`)
      failed.push({ title: project.title, error: String(err).slice(0, 100) })
    }
  }

  // ── Telegram summary ────────────────────────────────────────────────────────
  if (rendered.length > 0) {
    const lines = [
      `🎬 <b>Videos Ready to Post — ${today}</b>`,
      ``,
      ...rendered.map(r => [
        `${LANE_EMOJI[r.lane] ?? '🎬'} <b>${r.lane.replace(/_/g, ' ')}</b>`,
        `📁 ${path.basename(r.file)}`,
        `📂 Open Finder → colvin-content-os/out/ → post`,
      ].join('\n')),
      ``,
      failed.length > 0 ? `⚠️ ${failed.length} failed: ${failed.map(f => f.title).join(', ')}` : '',
      `✅ ${rendered.length} video(s) rendered and waiting in out/ folder`,
    ].filter(l => l !== '').join('\n')

    await sendTelegram(lines)
    console.log(`\n📱 Telegram notification sent`)
  }

  console.log(`\n✓ Done — ${rendered.length} rendered, ${failed.length} failed`)
  console.log(`📂 Files in: ${OUT_DIR}\n`)
}

main().catch(err => {
  console.error('FATAL:', err)
  process.exit(1)
})
