#!/usr/bin/env ts-node
/**
 * generate-audio.ts
 *
 * Generates two audio tracks for each video before rendering:
 *
 *   1. VOICEOVER — OpenAI TTS reads the video script aloud.
 *      Model: tts-1 (cheapest, ~$0.01 per 31s video).
 *      Voice: configurable per video (voiceover_voice field).
 *      Output: public/audio/[video_id]-vo.mp3
 *
 *   2. BACKGROUND MUSIC — royalty-free cinematic track.
 *      Source: Pixabay music API (free tier, PIXABAY_API_KEY in .env.local).
 *      Mood auto-detected from music_direction field.
 *      Cached to public/audio/music/ — only downloads once per mood.
 *      Output: public/audio/music/[mood].mp3
 *
 * Usage:
 *   npx ts-node scripts/generate-audio.ts videos/my-video.json
 *   npx ts-node scripts/generate-audio.ts  (processes all draft videos)
 *
 * After running, the JSON is updated with:
 *   voiceover_url: "/audio/[video_id]-vo.mp3"
 *   music_url:     "/audio/music/[mood].mp3"
 */

import * as fs from 'fs'
import * as path from 'path'
import * as https from 'https'
import * as http from 'http'

// ── Load .env.local ───────────────────────────────────────────────────────────
const ROOT = path.resolve(__dirname, '..')
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

const OPENAI_API_KEY  = process.env.OPENAI_API_KEY || ''
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY || ''
const VIDEOS_DIR      = path.join(ROOT, 'videos')
const AUDIO_DIR       = path.join(ROOT, 'public', 'audio')
const MUSIC_DIR       = path.join(AUDIO_DIR, 'music')

// Ensure directories
fs.mkdirSync(AUDIO_DIR, { recursive: true })
fs.mkdirSync(MUSIC_DIR, { recursive: true })

// ── GPT-powered energetic voiceover script generation ────────────────────────
// Uses GPT-4o-mini to write a punchy, lively ad script from the video content.
// The result is stored as voiceover_script in the JSON so it's reused on re-renders.
async function generateVoiceoverScript(videoScript: Record<string, unknown>): Promise<string | null> {
  if (!OPENAI_API_KEY) return null

  const scenes = (videoScript.scenes as Array<Record<string, unknown>>) ?? []
  const sceneLines = scenes.map((sc, i) => {
    const type    = sc.type ?? 'scene'
    const headline = sc.headline ?? ''
    const body     = sc.body ?? ''
    const caption  = sc.caption_text ?? ''
    const points   = (sc.pain_points as string[] | undefined)?.join(' / ') ?? ''
    const before   = sc.before_state ?? ''
    const after    = sc.after_state ?? ''
    return `Scene ${i + 1} (${type}): headline="${headline}" body="${body}" caption="${caption}" points="${points}" before="${before}" after="${after}"`
  }).join('\n')

  const prompt = `You are writing a SHORT energetic voiceover for a ${videoScript.format ?? '9:16'} short-form ad video. The video is ${scenes.length} scenes, ~${scenes.reduce((s: number, sc: Record<string, unknown>) => s + (Number(sc.duration_seconds) || 5), 0)} seconds total.

Brand: ${videoScript.brand}
Goal: ${videoScript.goal ?? 'drive action'}
Audience: ${videoScript.audience ?? 'general'}

Scene breakdown:
${sceneLines}

Write a punchy, lively, energetic voiceover script. Rules:
- Match the scene sequence (hook → pain → desire → mechanism → transformation → CTA)
- Use SHORT sentences. Direct. Urgent. Conversational.
- Use emphasis punctuation: exclamations on wins, ellipses on pauses, em dashes for punchlines
- No filler words ("um", "well", "so basically")
- The HOOK must GRAB attention immediately — bold opening statement
- Pain scenes: relatable frustration, not lecture
- Desire: paint the picture vividly
- CTA: clear single action, create urgency
- Total length: approx ${Math.round(scenes.reduce((s: number, sc: Record<string, unknown>) => s + (Number(sc.duration_seconds) || 5), 0) * 2.5)} words (spoken at natural pace)
- Output ONLY the narration text, no scene labels, no stage directions`

  const body = JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8,
    max_tokens: 400,
  })

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }
    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          const text = json.choices?.[0]?.message?.content?.trim()
          resolve(text ?? null)
        } catch { resolve(null) }
      })
      res.on('error', () => resolve(null))
    })
    req.on('error', () => resolve(null))
    req.write(body)
    req.end()
  })
}

// ── Voiceover script builder ──────────────────────────────────────────────────
// 1. If voiceover_script already in JSON → use it
// 2. Try GPT-4o-mini to write an energetic ad script
// 3. Fallback: join caption_text fields
async function buildVoiceoverScript(videoScript: Record<string, unknown>): Promise<string> {
  if (videoScript.voiceover_script && typeof videoScript.voiceover_script === 'string') {
    return videoScript.voiceover_script
  }

  // Try GPT script generation
  console.log('  📝 Writing energetic voiceover script with GPT-4o-mini...')
  const gptScript = await generateVoiceoverScript(videoScript)
  if (gptScript) {
    console.log(`  ✓ Script: "${gptScript.slice(0, 80)}..."`)
    return gptScript
  }

  // Fallback: join caption text
  const scenes = (videoScript.scenes as Array<Record<string, unknown>>) ?? []
  const lines: string[] = []
  for (const scene of scenes) {
    if (scene.caption_text && typeof scene.caption_text === 'string') lines.push(scene.caption_text)
    else if (scene.headline && typeof scene.headline === 'string') lines.push(scene.headline)
  }
  return lines.join('... ')
}

// ── Detect music mood from music_direction field ──────────────────────────────
function detectMusicMood(musicDirection?: string): { mood: string; query: string } {
  const d = (musicDirection ?? '').toLowerCase()

  if (d.includes('trap') || d.includes('hip-hop') || d.includes('hip hop')) {
    return { mood: 'hip-hop-cinematic', query: 'cinematic hip hop motivational' }
  }
  if (d.includes('gospel') || d.includes('soul') || d.includes('church')) {
    return { mood: 'gospel-soul', query: 'inspirational gospel piano' }
  }
  if (d.includes('tension') || d.includes('dark') || d.includes('intense')) {
    return { mood: 'cinematic-tension', query: 'cinematic tension dramatic' }
  }
  if (d.includes('triumph') || d.includes('epic') || d.includes('inspiring')) {
    return { mood: 'triumphant-epic', query: 'epic triumphant cinematic' }
  }
  if (d.includes('warm') || d.includes('hope') || d.includes('emotional')) {
    return { mood: 'warm-emotional', query: 'emotional inspiring piano' }
  }
  if (d.includes('piano')) {
    return { mood: 'cinematic-piano', query: 'cinematic piano ambient' }
  }

  // Default: cinematic ambient — works under any content
  return { mood: 'cinematic-ambient', query: 'cinematic ambient background' }
}

// ── Curated fallback music library (no API key needed) ───────────────────────
// SoundHelix royalty-free synthesized tracks — zero API key, zero cost.
// Verified working direct CDN URLs (7–21MB MP3s).
// These play under the voiceover at 18% volume — subtle, cinematic feel.
// For better quality tracks, add PIXABAY_API_KEY=your_free_key to .env.local
// (free signup: pixabay.com/api — 100 requests/hour, thousands of tracks).
const FALLBACK_MUSIC: Record<string, string> = {
  'hip-hop-cinematic':  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
  'cinematic-tension':  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
  'warm-emotional':     'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
  'triumphant-epic':    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  'gospel-soul':        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3',
  'cinematic-piano':    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
  'cinematic-ambient':  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
}

async function downloadMusicFallback(mood: string, outputPath: string): Promise<boolean> {
  const url = FALLBACK_MUSIC[mood] ?? FALLBACK_MUSIC['cinematic-ambient']
  console.log(`  ♪ Fallback music (freepd.com CC0): ${decodeURIComponent(url.split('/').pop()!)}`)

  return new Promise((resolve) => {
    const download = (dlUrl: string, redirects = 0): void => {
      if (redirects > 5) { resolve(false); return }
      const u = new URL(dlUrl)
      const proto = u.protocol === 'https:' ? https : http
      proto.get(dlUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          download(res.headers.location!, redirects + 1)
          return
        }
        if (res.statusCode !== 200) {
          console.log(`  ✗ Download failed (${res.statusCode}) — no background music for this render`)
          resolve(false)
          return
        }
        const chunks: Buffer[] = []
        res.on('data', (c: Buffer | string) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)))
        res.on('end', () => {
          const buf = Buffer.concat(chunks)
          if (buf.length < 10000) { // sanity check — real MP3 should be > 10KB
            console.log(`  ✗ Downloaded file too small (${buf.length}B) — skipping`)
            resolve(false)
            return
          }
          fs.writeFileSync(outputPath, buf)
          resolve(true)
        })
        res.on('error', () => resolve(false))
      }).on('error', () => resolve(false))
    }
    download(url)
  })
}

// ── OpenAI TTS voiceover generation ──────────────────────────────────────────
async function generateVoiceover(
  script: string,
  voice: string,
  outputPath: string
): Promise<boolean> {
  if (!OPENAI_API_KEY) {
    console.log('  ⚠ OPENAI_API_KEY not set — skipping voiceover')
    return false
  }

  const body = JSON.stringify({
    model: 'tts-1',
    input: script,
    voice,
    response_format: 'mp3',
    speed: 1.08, // slightly faster = more energy and momentum
  })

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.openai.com',
      path: '/v1/audio/speech',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }

    const req = https.request(options, (res) => {
      if (res.statusCode !== 200) {
        const chunks: Buffer[] = []
        res.on('data', c => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)))
        res.on('end', () => {
          console.log(`  ✗ TTS failed (${res.statusCode}):`, Buffer.concat(chunks).toString().slice(0, 200))
          resolve(false)
        })
        return
      }

      const chunks: Buffer[] = []
      res.on('data', c => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)))
      res.on('end', () => {
        fs.writeFileSync(outputPath, Buffer.concat(chunks))
        resolve(true)
      })
      res.on('error', () => resolve(false))
    })

    req.on('error', (e) => { console.error('  ✗ TTS request error:', e.message); resolve(false) })
    req.write(body)
    req.end()
  })
}

// ── Pixabay music fetch ───────────────────────────────────────────────────────
interface PixabayHit { audio_file: string; title: string; duration: number }

async function fetchPixabayMusic(query: string, outputPath: string): Promise<boolean> {
  if (!PIXABAY_API_KEY) {
    console.log('  ⚠ PIXABAY_API_KEY not set — add free key from pixabay.com/api for background music')
    return false
  }

  // Step 1: Search Pixabay music
  const searchUrl = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&category=music&media_type=music&per_page=5&min_duration=20`

  const searchResult = await new Promise<PixabayHit | null>((resolve) => {
    https.get(searchUrl, (res) => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          const hits: PixabayHit[] = json.hits ?? []
          // Pick track > 20s long
          const pick = hits.find(h => h.duration >= 20) ?? hits[0]
          resolve(pick ?? null)
        } catch { resolve(null) }
      })
      res.on('error', () => resolve(null))
    }).on('error', () => resolve(null))
  })

  if (!searchResult?.audio_file) {
    console.log(`  ⚠ No Pixabay music found for: "${query}"`)
    return false
  }

  console.log(`  ♪ Downloading: "${searchResult.title}" (${searchResult.duration}s)`)

  // Step 2: Download the MP3
  return new Promise((resolve) => {
    const url = new URL(searchResult.audio_file)
    const protocol = url.protocol === 'https:' ? https : http

    const download = (dlUrl: string, redirects = 0): void => {
      if (redirects > 5) { resolve(false); return }
      const u = new URL(dlUrl)
      const proto = u.protocol === 'https:' ? https : http
      proto.get(dlUrl, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          download(res.headers.location!, redirects + 1)
          return
        }
        const chunks: Buffer[] = []
        res.on('data', c => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)))
        res.on('end', () => {
          fs.writeFileSync(outputPath, Buffer.concat(chunks))
          resolve(true)
        })
        res.on('error', () => resolve(false))
      }).on('error', () => resolve(false))
    }

    download(searchResult.audio_file)
  })
}

// ── Process one video ─────────────────────────────────────────────────────────
async function processVideo(jsonPath: string): Promise<void> {
  const videoScript = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
  const videoId   = videoScript.video_id ?? path.basename(jsonPath, '.json')
  let updated     = false

  // ── Voiceover ──
  if (!videoScript.voiceover_url) {
    const script   = await buildVoiceoverScript(videoScript)
    // Save the generated script back into the JSON so it's visible + reusable
    if (!videoScript.voiceover_script) {
      videoScript.voiceover_script = script
      updated = true
    }
    const voice    = videoScript.voiceover_voice ?? 'echo'  // echo = energetic & natural
    const voPath   = path.join(AUDIO_DIR, `${videoId}-vo.mp3`)
    const voPublic = `/audio/${videoId}-vo.mp3`

    console.log(`  🎙 Voiceover: ${script.length} chars, voice="${voice}"`)
    console.log(`     Script preview: "${script.slice(0, 80)}..."`)

    const ok = await generateVoiceover(script, voice, voPath)
    if (ok) {
      videoScript.voiceover_url = voPublic
      const sizeKb = (fs.statSync(voPath).size / 1024).toFixed(0)
      console.log(`  ✓ Voiceover saved: ${voPublic} (${sizeKb}KB)`)
      updated = true
    }
  } else {
    console.log(`  ✓ Voiceover already resolved: ${videoScript.voiceover_url}`)
  }

  // ── Background music ──
  if (!videoScript.music_url) {
    const { mood, query } = detectMusicMood(videoScript.music_direction)
    const musicPath   = path.join(MUSIC_DIR, `${mood}.mp3`)
    const musicPublic = `/audio/music/${mood}.mp3`

    if (fs.existsSync(musicPath)) {
      console.log(`  ♪ Music cached: ${musicPublic}`)
      videoScript.music_url = musicPublic
      updated = true
    } else {
      let ok = false

      if (PIXABAY_API_KEY) {
        console.log(`  ♪ Fetching music via Pixabay: mood="${mood}", query="${query}"`)
        ok = await fetchPixabayMusic(query, musicPath)
      }

      // Fallback: freepd.com CC0 library (no API key needed)
      if (!ok) {
        ok = await downloadMusicFallback(mood, musicPath)
      }

      if (ok) {
        videoScript.music_url = musicPublic
        const sizeMb = (fs.statSync(musicPath).size / 1024 / 1024).toFixed(1)
        console.log(`  ✓ Music saved: ${musicPublic} (${sizeMb}MB)`)
        updated = true
      }
    }
  } else {
    console.log(`  ♪ Music already resolved: ${videoScript.music_url}`)
  }

  if (updated) {
    fs.writeFileSync(jsonPath, JSON.stringify(videoScript, null, 2))
    console.log(`  Saved audio URLs to ${path.basename(jsonPath)}`)
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const hasOpenAI  = !!OPENAI_API_KEY
  const hasPixabay = !!PIXABAY_API_KEY

  console.log(`\n🔊 Audio source: ${hasOpenAI ? '🎙 OpenAI TTS tts-1 (voiceover)' : '⚠ OPENAI_API_KEY missing'} | Music: ${hasPixabay ? '♪ Pixabay free' : '⚠ PIXABAY_API_KEY missing (free at pixabay.com/api)'}\n`)

  const arg = process.argv[2]

  if (arg) {
    const jsonPath = path.isAbsolute(arg) ? arg : path.join(VIDEOS_DIR, arg)
    if (!fs.existsSync(jsonPath)) { console.error(`File not found: ${jsonPath}`); process.exit(1) }
    console.log(`Generating audio for: ${path.basename(jsonPath)}\n`)
    await processVideo(jsonPath)
    console.log('\nDone.')
    return
  }

  if (!fs.existsSync(VIDEOS_DIR)) { console.log('No videos/ directory found'); return }
  const files = fs.readdirSync(VIDEOS_DIR).filter(f => f.endsWith('.json'))
  if (!files.length) { console.log('No video JSON files found'); return }

  console.log(`Generating audio for ${files.length} video(s)...\n`)
  for (const file of files) {
    console.log(`📹 ${file}`)
    const jsonPath = path.join(VIDEOS_DIR, file)
    const script = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
    if (script.render_status === 'rendered') { console.log('  (already rendered — skipping)\n'); continue }
    await processVideo(jsonPath)
    console.log('')
  }
  console.log('Done.')
}

main().catch(err => { console.error('FATAL:', err); process.exit(1) })
