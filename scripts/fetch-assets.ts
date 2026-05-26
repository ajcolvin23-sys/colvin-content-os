#!/usr/bin/env ts-node
/**
 * fetch-assets.ts
 *
 * Before rendering, searches Pexels for a people photo for each scene
 * that has an assets[] entry with a description but no URL yet.
 *
 * Updates the VideoScript JSON in videos/ in place so render-daily picks
 * up the resolved URLs automatically.
 *
 * Usage:
 *   npx ts-node scripts/fetch-assets.ts          — process all draft videos
 *   npx ts-node scripts/fetch-assets.ts my-video.json  — single file
 */

import * as fs from 'fs'
import * as path from 'path'
import * as https from 'https'

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

const PEXELS_API_KEY = process.env.PEXELS_API_KEY || ''
const VIDEOS_DIR     = path.join(ROOT, 'videos')

// ── Pexels search ─────────────────────────────────────────────────────────────
interface PexelsPhoto {
  id: number
  src: { original: string; large2x: string; large: string; portrait: string }
  photographer: string
  alt: string
}

async function searchPexels(query: string, orientation = 'portrait'): Promise<string | null> {
  if (!PEXELS_API_KEY) {
    console.warn('  ⚠ PEXELS_API_KEY not set — skipping image fetch')
    return null
  }

  return new Promise((resolve) => {
    const encodedQuery = encodeURIComponent(query)
    const options = {
      hostname: 'api.pexels.com',
      path: `/v1/search?query=${encodedQuery}&orientation=${orientation}&per_page=5&size=large`,
      headers: { Authorization: PEXELS_API_KEY },
    }

    https.get(options, (res) => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          const photos: PexelsPhoto[] = json.photos ?? []
          if (photos.length === 0) { resolve(null); return }
          // Pick the first portrait photo — best for 9:16 vertical video
          resolve(photos[0].src.portrait || photos[0].src.large2x)
        } catch { resolve(null) }
      })
      res.on('error', () => resolve(null))
    }).on('error', () => resolve(null))
  })
}

// ── Per-lane Pexels search terms ──────────────────────────────────────────────
// Gabriel writes a description, but Pexels works better with focused terms.
// These supplement the scene description with lane-specific people context.
const LANE_PHOTO_CONTEXT: Record<string, string> = {
  first_keys_indy:      'Black family homebuyer happy home keys',
  colvin_enterprises:   'Black entrepreneur business professional office',
  music_theory_secrets: 'Black musician piano keyboard playing',
  indiana_backflow:     'plumber technician professional work',
}

// Scene type → best Pexels search supplement
const SCENE_TYPE_SUPPLEMENT: Record<string, string> = {
  hook:     'person confident portrait',
  problem:  'stressed frustrated person',
  solution: 'person happy relieved success',
  proof:    'person celebrating achievement',
  cta:      'person smiling confident',
  slide:    'person portrait',
}

function buildSearchQuery(description: string, lane: string, sceneType: string): string {
  const laneCtx  = LANE_PHOTO_CONTEXT[lane] ?? 'person professional'
  const typeCtx  = SCENE_TYPE_SUPPLEMENT[sceneType] ?? 'person'
  // Use description if it's specific, otherwise fall back to lane+type context
  if (description && description.length > 10 && !description.includes('TODO')) {
    return `${description} ${laneCtx}`
  }
  return `${laneCtx} ${typeCtx}`
}

// ── Process one video JSON file ───────────────────────────────────────────────
async function processVideoFile(jsonPath: string): Promise<number> {
  const videoScript = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
  const lane = videoScript.brand ?? 'colvin_enterprises'
  let fetched = 0

  for (const scene of videoScript.scenes ?? []) {
    if (!scene.assets || scene.assets.length === 0) continue

    for (const asset of scene.assets) {
      if (asset.type !== 'image' && asset.type !== 'background') continue
      if (asset.url) continue // already resolved

      const query = buildSearchQuery(asset.description ?? '', lane, scene.type)
      console.log(`  [${scene.id}] Searching Pexels: "${query.slice(0, 60)}"...`)

      const url = await searchPexels(query)
      if (url) {
        asset.url = url
        fetched++
        console.log(`  ✓ Found: ${url.slice(0, 70)}...`)
      } else {
        console.log(`  ✗ No result — scene will use brand color fallback`)
      }

      // Pexels rate limit: 200 req/hour, be polite
      await new Promise(r => setTimeout(r, 300))
    }
  }

  if (fetched > 0) {
    fs.writeFileSync(jsonPath, JSON.stringify(videoScript, null, 2))
    console.log(`  Saved ${fetched} image URL(s) to ${path.basename(jsonPath)}`)
  }

  return fetched
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const arg = process.argv[2]

  if (arg) {
    // Single file mode
    const jsonPath = path.isAbsolute(arg) ? arg : path.join(VIDEOS_DIR, arg)
    if (!fs.existsSync(jsonPath)) { console.error(`File not found: ${jsonPath}`); process.exit(1) }
    console.log(`\nFetching assets for: ${path.basename(jsonPath)}\n`)
    const count = await processVideoFile(jsonPath)
    console.log(`\nDone — ${count} image(s) fetched`)
    return
  }

  // All draft videos mode
  if (!fs.existsSync(VIDEOS_DIR)) { console.log('No videos/ directory found'); return }
  const files = fs.readdirSync(VIDEOS_DIR).filter(f => f.endsWith('.json'))
  if (files.length === 0) { console.log('No video JSON files found in videos/'); return }

  console.log(`\nFetching Pexels images for ${files.length} video(s)...\n`)
  let total = 0
  for (const file of files) {
    console.log(`📹 ${file}`)
    const jsonPath = path.join(VIDEOS_DIR, file)
    const script = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
    // Skip already-rendered videos
    if (script.render_status === 'rendered') { console.log('  (already rendered — skipping)\n'); continue }
    total += await processVideoFile(jsonPath)
    console.log('')
  }
  console.log(`Done — ${total} total image(s) fetched across all videos`)
}

main().catch(err => { console.error('FATAL:', err); process.exit(1) })
