#!/usr/bin/env ts-node
/**
 * fetch-assets.ts
 *
 * Generates cinematic AI images via OpenAI DALL-E 3 for each video scene
 * that has an assets[] entry with a description but no URL yet.
 *
 * Falls back to Pexels if OPENAI_API_KEY is not set or generation fails.
 *
 * Each lane has emotionally directed prompts per scene mood:
 *   PROBLEM  (hook, problem)  → tension, struggle, cold blue light
 *   SOLUTION (solution, proof, cta) → triumph, warmth, golden light
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

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''
const PEXELS_API_KEY = process.env.PEXELS_API_KEY || ''
const VIDEOS_DIR     = path.join(ROOT, 'videos')

// ── Types ─────────────────────────────────────────────────────────────────────
type EmotionalState = 'problem' | 'solution'
// pain_stack added: maximum tension scenes should use problem-state imagery
const PROBLEM_SCENE_TYPES = new Set(['hook', 'problem', 'pain_stack'])

// ── DALL-E 3 cinematic prompts per lane, mood, and scene type ─────────────────
//
// Written like a cinematographer's brief:
//   subject + emotion + lighting + depth of field + color tone + photorealistic
//
// SCENE_TYPE_OVERRIDES lets specific scene types (desire, mechanism,
// transformation) get targeted prompts instead of the generic solution pool.

const SCENE_TYPE_OVERRIDES: Record<string, Record<string, string[]>> = {
  first_keys_indy: {
    desire: [
      'Cinematic portrait of a Black woman standing in front of a beautiful home, eyes closed and face lifted upward in peaceful hope, warm golden hour glow, shallow depth of field, aspirational and dreamlike, photorealistic',
      'Dramatic wide shot of a Black family walking toward a beautiful suburban home together, golden afternoon sunlight, sense of possibility and hope, emotional, cinematic, photorealistic',
    ],
    transformation: [
      'Split-frame cinematic portrait: left side shows a Black woman anxious with lease rejection papers in a dim apartment; right side shows the same woman tearfully joyful holding house keys outside her new home in golden light — dramatic transformation story, photorealistic',
      'Cinematic close-up of a Black woman receiving keys with joy, tears streaming, sense of everything changing in one moment, warm golden light, shallow depth of field, emotional peak, photorealistic',
    ],
    mechanism: [
      'Clean cinematic shot of a professional Black woman at a desk in a bright modern office, organized documents and laptop open, warm purposeful lighting, sense of clarity and process, photorealistic',
      'Cinematic portrait of a calm Black financial counselor explaining something with a reassuring smile, warm light, professional modern office, client across from her, trust and guidance, photorealistic',
    ],
    cta: [
      'Cinematic close-up of a Black woman and man standing at a front door together, both smiling wide holding keys, family behind them, warm celebratory golden light, triumph and new beginnings, photorealistic',
      'Dramatic portrait of a Black family on their new front porch — mother, father, children — all embracing with pure joy, warm evening light, deep emotional payoff, photorealistic',
    ],
  },
  colvin_enterprises: {
    desire: [
      'Cinematic portrait of a Black entrepreneur, relaxed and confident, sitting in a bright airy home office, sunlight through large windows, laptop open, serene expression of control and freedom, shallow depth of field, photorealistic',
      'Dramatic portrait of a successful Black professional standing at a floor-to-ceiling window overlooking Indianapolis skyline, relaxed posture, warm afternoon light, sense of clarity and possibility, photorealistic',
    ],
    transformation: [
      'Split-frame cinematic portrait: left side shows overwhelmed business owner drowning in papers at dark cluttered desk; right side shows the same professional relaxed and smiling at a clean modern desk with soft morning light — AI transformation story, photorealistic',
      'Cinematic close-up of a Black businessman, moment of relief and confidence, tension gone from his face, warm golden office light, shallow depth of field, photorealistic',
    ],
    mechanism: [
      'Clean cinematic overhead shot of a modern workspace with a laptop showing a sleek AI dashboard, minimal desk, warm natural morning light, sense of elegant simplicity and system, photorealistic',
      'Cinematic portrait of a focused Black professional reviewing a clean data dashboard on a large monitor, purposeful calm expression, bright modern office, warm light, photorealistic',
    ],
    cta: [
      'Cinematic portrait of a confident Black entrepreneur standing at a window with Indianapolis skyline behind, relaxed genuine smile, sense of achievement and freedom, warm late-afternoon light, shallow depth of field, photorealistic',
      'Dramatic portrait of a successful businesswoman, arm extended forward in confident invitation gesture, warm office, genuine warm smile, triumphant energy, photorealistic',
    ],
  },
  music_theory_secrets: {
    desire: [
      'Cinematic portrait of a Black gospel musician, eyes half-closed in pure musical joy, playing piano in a warmly lit church, soft stage light from above, sense of total freedom and spiritual connection, shallow depth of field, photorealistic',
      'Dramatic wide shot of a Black pianist playing confidently on a church stage, congregation blurred in background, warm golden stage lights, feeling of mastery and purpose, photorealistic',
    ],
    transformation: [
      'Split-frame cinematic portrait: left side shows a young Black musician hunched over confusing sheet music in a dim church; right side shows the same musician playing confidently with eyes closed and a radiant smile in warm stage light — musical breakthrough, photorealistic',
      'Cinematic close-up of a Black musician face in the moment of musical breakthrough — eyes opening wide with sudden understanding, warm light, pure joy replacing confusion, photorealistic',
    ],
    mechanism: [
      'Clean cinematic close-up of hands on piano keys with light notation diagrams floating above, warm church light, purposeful and clear, sense of simple elegant understanding, photorealistic',
      'Cinematic portrait of a calm Black music teacher pointing at a simple chord chart, gentle reassuring expression, bright music studio, warm light, student across from her, photorealistic',
    ],
    cta: [
      'Cinematic portrait of a Black pianist performing confidently on a church stage, face full of joy and mastery, warm golden spotlight, congregation in soft background, triumph and purpose, photorealistic',
      'Dramatic close-up of a Black musician hands playing piano with total confidence, warm church stage light, shallow depth of field, sense of complete mastery, photorealistic',
    ],
  },
}

const LANE_PROMPTS: Record<string, Record<EmotionalState, string[]>> = {

  first_keys_indy: {
    problem: [
      'Cinematic close-up portrait of a Black woman in her 30s, eyes downcast, exhausted worried expression, sitting in a small dimly lit apartment, cool blue window light from the side, shallow depth of field, raw emotional documentary photography, photorealistic',
      'Dramatic portrait of an African American woman on a worn apartment couch, overwhelmed expression, pile of bills on the table, cold desaturated grey light, deep cinematic shadows, shallow focus, photorealistic',
      'Cinematic portrait of a Black family in a cramped apartment — mother and two children — anxious expressions, dim harsh overhead light, cool blue-grey color tone, raw emotional photography, photorealistic',
      'Dark cinematic close-up of a young Black woman staring at a lease rejection letter, deep concern in her eyes, blurred bare apartment wall, cold fluorescent light, emotional and raw, photorealistic',
    ],
    solution: [
      'Cinematic portrait of a joyful Black woman holding house keys up in front of a beautiful home, tears of joy on her face, radiant smile, warm golden hour sunlight, shallow depth of field, triumph and emotion, photorealistic',
      'Dramatic wide shot of a Black family at the front door of their new home — mother, father, child — euphoric expressions, warm amber sunset light, cinematic color grade, photorealistic',
      'Cinematic close-up of an African American couple embracing outside their first home, woman holding keys up laughing and crying with joy, golden hour bokeh behind them, warm cinematic tones, photorealistic',
      'Emotional portrait of a Black grandmother, daughter, and granddaughter holding house keys together in front of a newly purchased home, tears of happiness, warm morning light, shallow depth of field, photorealistic',
    ],
  },

  colvin_enterprises: {
    problem: [
      'Cinematic close-up of a businessman in his 40s, exhausted, head in hands at a cluttered desk, harsh blue computer monitor glow in a dark late-night office, stacks of papers, deep moody shadows, photorealistic',
      'Dramatic portrait of a stressed professional woman, overwhelmed, rubbing her eyes at a desk, dark office, cold harsh fluorescent overhead light, scattered documents, blue desaturated tone, shallow focus, photorealistic',
      'Cinematic shot of a tired entrepreneur slumped back in a chair, empty coffee cups and scattered papers on desk, head back eyes closed in exhaustion, dark moody office, cold blue light, photorealistic',
      'Dark cinematic portrait of a businessman staring blankly at a laptop screen at midnight, hollow exhausted expression, blue screen glow as only light source, deep shadows, photorealistic',
    ],
    solution: [
      'Cinematic portrait of a confident Black entrepreneur, relaxed genuine smile, bright modern office with floor-to-ceiling windows, warm golden morning sunlight, clean desk, sense of peace and mastery, shallow depth of field, photorealistic',
      'Dramatic portrait of a successful businesswoman, poised and radiant, leaning back in her chair, bright modern office, warm morning light, serene expression of freedom and achievement, photorealistic',
      'Cinematic wide shot of a business professional standing at a window overlooking a city skyline, relaxed posture, subtle proud smile, warm afternoon golden light, clean tailored suit, calm accomplishment, photorealistic',
      'Cinematic portrait of a successful entrepreneur on a rooftop, confident and relaxed, city skyline behind, warm sunset light, genuine smile, feeling of freedom and success, shallow depth of field, photorealistic',
    ],
  },

  music_theory_secrets: {
    problem: [
      'Cinematic close-up of a Black musician at an upright piano inside a church, staring at sheet music with a deeply confused frustrated expression, dramatic directional side light through stained glass, pews soft in background, shallow depth of field, photorealistic',
      'Dramatic portrait of a young Black man at a piano keyboard, hunched over complex sheet music, rubbing his forehead in frustration, dim church interior lighting, cold moody color tone, photorealistic',
      'Cinematic shot of an African American music student overwhelmed by sheet music spread across a piano, confused distressed expression, dim church ambient light casting long shadows, photorealistic',
      'Dark cinematic close-up of a Black teenager staring at a piano score in confusion, notation blurred out of focus in background, tense frustrated expression, dramatic church window backlighting, photorealistic',
    ],
    solution: [
      'Cinematic portrait of a Black gospel pianist, eyes closed in pure joy, playing keyboard on a warm glowing church stage, expression of deep confidence and spiritual passion, warm amber stage lights, congregation softly blurred, shallow depth of field, photorealistic',
      'Dramatic wide shot of a confident Black musician at a grand piano in a church, upright powerful posture, radiant with musical expression, warm golden stage spotlights, photorealistic',
      'Cinematic close-up of a Black music teacher at a piano keyboard, radiant warm smile, playing effortlessly from memory, bright music studio, sense of total mastery and joy, photorealistic',
      'Emotional cinematic portrait of a young Black woman playing piano in a church, face uplifted with joy, tears of emotion while playing, warm stage light, shallow depth of field, photorealistic',
    ],
  },
}

// ── Pexels fallback queries ───────────────────────────────────────────────────
const PEXELS_FALLBACK: Record<string, Record<EmotionalState, string[]>> = {
  first_keys_indy: {
    problem:  ['Black woman worried stressed apartment renting', 'African American family sad concerned housing', 'Black person worried about money rent bills', 'African American woman anxious looking down portrait'],
    solution: ['Black family celebrating new home front door happy', 'African American couple house keys smiling joy', 'Black family homeowner proud new house', 'African American woman holding house keys celebrating'],
  },
  colvin_enterprises: {
    problem:  ['businessman overwhelmed working late office stressed', 'business professional exhausted paperwork overtime', 'office worker frustrated computer long hours tired', 'entrepreneur stressed overworked desk pile of papers'],
    solution: ['business professional relaxed confident successful office', 'entrepreneur smiling laptop success celebrating', 'business owner happy productive modern office', 'professional team celebrating business win office'],
  },
  music_theory_secrets: {
    problem:  ['musician frustrated confused sheet music notes', 'piano student struggling reading music notation', 'church musician confused looking at sheet music', 'person frustrated trying to learn piano music theory'],
    solution: ['Black musician playing piano church confident smiling', 'happy pianist performing keys enjoying music', 'music teacher confident piano studio teaching', 'gospel musician playing keyboard church joyful'],
  },
}

// ── OpenAI DALL-E 3 image generation ─────────────────────────────────────────
async function generateImageDallE(prompt: string): Promise<string | null> {
  if (!OPENAI_API_KEY) return null

  return new Promise((resolve) => {
    const payload = JSON.stringify({
      model: 'gpt-image-1-mini',  // cheapest available image model
      prompt,
      size: '1024x1536',          // closest to 9:16 portrait for vertical video
      n: 1,
      output_format: 'png',       // returns b64_json, saved to disk as file://
    })

    const options = {
      hostname: 'api.openai.com',
      path: '/v1/images/generations',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          if (json.error) {
            console.log(`  ⚠ gpt-image error: ${json.error.message?.slice(0, 100)}`)
            resolve(null)
            return
          }
          const b64 = json.data?.[0]?.b64_json
          if (!b64) { resolve(null); return }

          // Store as data URI — works in Remotion's headless Chrome
          // without needing a server or file:// paths
          resolve(`data:image/png;base64,${b64}`)
        } catch { resolve(null) }
      })
      res.on('error', () => resolve(null))
    })

    req.on('error', () => resolve(null))
    req.write(payload)
    req.end()
  })
}

// ── Pexels fallback ───────────────────────────────────────────────────────────
interface PexelsPhoto { src: { portrait: string; large2x: string } }

async function searchPexels(query: string): Promise<string | null> {
  if (!PEXELS_API_KEY) return null

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.pexels.com',
      path: `/v1/search?query=${encodeURIComponent(query)}&orientation=portrait&per_page=5&size=large`,
      headers: { Authorization: PEXELS_API_KEY },
    }
    https.get(options, (res) => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          const photos: PexelsPhoto[] = json.photos ?? []
          resolve(photos.length ? (photos[0].src.portrait || photos[0].src.large2x) : null)
        } catch { resolve(null) }
      })
      res.on('error', () => resolve(null))
    }).on('error', () => resolve(null))
  })
}

// ── Pick index by description hash (variety across runs) ─────────────────────
function pickIndex(description: string, len: number): number {
  return Math.abs(description.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % len
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
      if (asset.url) continue  // already resolved

      const state: EmotionalState = PROBLEM_SCENE_TYPES.has(scene.type) ? 'problem' : 'solution'
      const description = asset.description ?? ''

      // ── Try DALL-E 3 first ──
      const lanePrompts = LANE_PROMPTS[lane]
      if (lanePrompts && OPENAI_API_KEY) {
        // Check for scene-type-specific override prompts first
        const typeOverrides = SCENE_TYPE_OVERRIDES[lane]?.[scene.type]
        const prompts = typeOverrides ?? lanePrompts[state]
        const prompt  = prompts[pickIndex(description, prompts.length)]
        console.log(`  [${scene.id ?? scene.type}] gpt-image-1-mini (${state}): "${prompt.slice(0, 70)}..."`)
        const url = await generateImageDallE(prompt)
        if (url) {
          asset.url    = url
          asset.source = 'gpt-image-1-mini'
          fetched++
          console.log(`  ✓ Generated: ${url.slice(0, 70)}...`)
          await new Promise(r => setTimeout(r, 500))  // DALL-E rate limit courtesy pause
          continue
        }
        console.log(`  ↩ DALL-E failed — falling back to Pexels`)
      }

      // ── Pexels fallback ──
      const lanePexels = PEXELS_FALLBACK[lane]
      if (lanePexels) {
        const queries = lanePexels[state]
        const query   = queries[pickIndex(description, queries.length)]
        console.log(`  [${scene.id ?? scene.type}] Pexels fallback: "${query}"`)
        const url = await searchPexels(query)
        if (url) {
          asset.url    = url
          asset.source = 'pexels'
          fetched++
          console.log(`  ✓ Pexels: ${url.slice(0, 70)}...`)
        } else {
          console.log(`  ✗ No image found — scene will use brand color fallback`)
        }
        await new Promise(r => setTimeout(r, 300))
      }
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
  const usingDallE  = !!OPENAI_API_KEY
  const usingPexels = !!PEXELS_API_KEY
  console.log(`\nImage source: ${usingDallE ? '🎨 OpenAI gpt-image-1-mini (primary)' : '⚠ OPENAI_API_KEY missing'} | Pexels fallback: ${usingPexels ? '✓' : '✗'}\n`)

  const arg = process.argv[2]

  if (arg) {
    const jsonPath = path.isAbsolute(arg) ? arg : path.join(VIDEOS_DIR, arg)
    if (!fs.existsSync(jsonPath)) { console.error(`File not found: ${jsonPath}`); process.exit(1) }
    console.log(`Generating images for: ${path.basename(jsonPath)}\n`)
    const count = await processVideoFile(jsonPath)
    console.log(`\nDone — ${count} image(s) generated`)
    return
  }

  if (!fs.existsSync(VIDEOS_DIR)) { console.log('No videos/ directory found'); return }
  const files = fs.readdirSync(VIDEOS_DIR).filter(f => f.endsWith('.json'))
  if (files.length === 0) { console.log('No video JSON files found in videos/'); return }

  console.log(`Generating images for ${files.length} video(s)...\n`)
  let total = 0
  for (const file of files) {
    console.log(`📹 ${file}`)
    const jsonPath = path.join(VIDEOS_DIR, file)
    const script = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
    if (script.render_status === 'rendered') { console.log('  (already rendered — skipping)\n'); continue }
    total += await processVideoFile(jsonPath)
    console.log('')
  }
  console.log(`Done — ${total} total image(s) generated across all videos`)
}

main().catch(err => { console.error('FATAL:', err); process.exit(1) })
