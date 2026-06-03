#!/usr/bin/env ts-node
/**
 * test-remotion-studio.ts — Phase 1 exit criteria.
 * Runs the Remotion Video Studio (7 agents) through Hermes for a video lane,
 * QA-gates the blueprint, writes the renderable VideoScript JSON, and logs every
 * agent run. With --render it also produces a real MP4 via the existing pipeline
 * (fetch-assets → generate-audio → remotion render), proving end-to-end.
 *   npm run test:studio            # produce + QA + write JSON (fast)
 *   npm run test:studio -- --render   # also render the MP4
 */
import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'

const ROOT = path.resolve(__dirname, '../..')

// Load .env.local before anything reads process.env (dotenv/config doesn't pick
// up .env.local reliably with these values; mirror the other scripts).
;(() => {
  const envPath = path.join(ROOT, '.env.local')
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim(); if (!t || t.startsWith('#')) continue
    const i = t.indexOf('='); if (i < 0) continue
    const k = t.slice(0, i).trim(), v = t.slice(i + 1).trim()
    if (!process.env[k]) process.env[k] = v
  }
})()

import { runVideoStudio } from '../../lib/hermes/agents/remotion'
const LANE = process.env.STUDIO_LANE || 'music_theory_secrets'
const DO_RENDER = process.argv.includes('--render')

async function main() {
  const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'automation-os/config/gabriel-config.json'), 'utf8'))
  const strat = cfg.lane_strategy[LANE] || {}
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  const hooks: string[] = strat.hooks || ['Most people have this backwards.']
  const hook = hooks[dayOfYear % hooks.length]

  console.log(`\n🎬 Remotion Studio — lane ${LANE}`)
  const res = await runVideoStudio({
    lane: LANE, platform: 'tiktok', hook,
    transformation: strat.transformation, rung_label: strat.rung_label,
    cta: strat.cta || strat.cta_buyers || 'Learn more',
  })

  console.log(`\nStudio ok: ${res.ok} | QA issues: ${res.issues.length ? res.issues.join('; ') : 'none'}`)
  if (!res.ok || !res.blueprint) { console.log('❌ Studio failed QA gate — no renderable blueprint.'); process.exit(1) }

  const bp = res.blueprint as Record<string, unknown>
  const scenes = bp.scenes as Array<{ type: string; duration_seconds: number }>
  console.log(`Blueprint: ${bp.video_id}`)
  console.log(`  scenes: ${scenes.map((s) => `${s.type}(${s.duration_seconds}s)`).join(' → ')}`)
  console.log(`  total: ${bp.duration_seconds}s | voice: ${bp.voiceover_voice} | format: ${bp.format}`)

  // Write the renderable VideoScript JSON (what render-daily/VideoEngine consume).
  const videosDir = path.join(ROOT, 'videos'); fs.mkdirSync(videosDir, { recursive: true })
  const jsonPath = path.join(videosDir, `${bp.video_id}.json`)
  fs.writeFileSync(jsonPath, JSON.stringify(bp, null, 2))
  console.log(`  ✓ wrote ${path.relative(ROOT, jsonPath)} (renderable)`)

  if (DO_RENDER) {
    console.log('\n⏳ Rendering (fetch-assets → generate-audio → remotion)...')
    execSync(`npx ts-node --project remotion/tsconfig.json scripts/fetch-assets.ts "${jsonPath}"`, { cwd: ROOT, stdio: 'inherit' })
    execSync(`npx ts-node --project remotion/tsconfig.json scripts/generate-audio.ts "${jsonPath}"`, { cwd: ROOT, stdio: 'inherit' })
    const reloaded = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
    const outDir = path.join(ROOT, 'out'); fs.mkdirSync(outDir, { recursive: true })
    const propsFile = path.join(outDir, `${bp.video_id}-props.json`)
    const outMp4 = path.join(outDir, `${bp.video_id}.mp4`)
    fs.writeFileSync(propsFile, JSON.stringify({ videoScript: reloaded }))
    execSync(`npx remotion render remotion/index.ts VideoEngine-Vertical "${outMp4}" --props="${propsFile}" --log=error`, { cwd: ROOT, stdio: 'inherit' })
    fs.unlinkSync(propsFile)
    const mb = fs.existsSync(outMp4) ? (fs.statSync(outMp4).size / 1048576).toFixed(1) : '?'
    console.log(`  ✓ rendered ${path.basename(outMp4)} — ${mb} MB`)
  }

  console.log(`\n✅ PHASE 1 STUDIO: blueprint produced through Hermes (7 agents), QA-gated, observable in logs/agent_runs.jsonl.`)
  if (!DO_RENDER) console.log('   (re-run with `-- --render` to produce the MP4 too)')
}

main().catch((e) => { console.error('FATAL:', e); process.exit(1) })
