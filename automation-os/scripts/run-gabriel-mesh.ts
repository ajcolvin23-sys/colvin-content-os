#!/usr/bin/env ts-node
/**
 * run-gabriel-mesh.ts — Gabriel Daily through the Hermes agent mesh (SHADOW).
 * Reproduces the daily content run via the promoted agents. Does NOT replace
 * the live gabriel:daily — use it to eyeball parity before flipping the default.
 *   npm run gabriel:mesh                      # all active lanes
 *   npm run gabriel:mesh -- --lanes=colvin_enterprises,music_theory_secrets
 *   npm run gabriel:mesh -- --no-video        # skip video render (cheap shadow)
 */
import * as fs from 'fs'
import * as path from 'path'

const ROOT = path.resolve(__dirname, '../..')
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

import { runGabrielDailyMesh } from '../../lib/hermes/pipelines/gabriel-daily'

async function main() {
  const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'automation-os/config/gabriel-config.json'), 'utf8'))
  const lanesArg = process.argv.find((a) => a.startsWith('--lanes='))
  const lanes = lanesArg ? lanesArg.split('=')[1].split(',') : cfg.active_lanes
  const genVideo = !process.argv.includes('--no-video')

  const result = await runGabrielDailyMesh({
    activeLanes: cfg.active_lanes,
    strategy: cfg.lane_strategy,
    model: cfg.model_routing.content_generation,
    lanes,
    genVideo,
    outDir: path.join(ROOT, 'out/colvin-previews'),
  })

  console.log('── Drafts produced through the mesh ──')
  for (const d of result.drafts) console.log(`  ${d.lane.padEnd(22)} ${d.platform.padEnd(10)} ${d.type}${d.chars ? ` (${d.chars} chars)` : ''}${d.ref ? ` → ${path.basename(String(d.ref))}` : ''}`)
  if (result.seo) console.log(`\nSEO (${result.seo.lane}): ${result.seo.opportunities.length} opportunities`)
  console.log(`Marketing: ${result.recommendations.length} recommendations`)
  if (result.errors.length) console.log(`\n⚠ ${result.errors.length} error(s): ${result.errors.join(' | ')}`)
  console.log(`\n✅ SHADOW RUN complete — ${result.drafts.length} drafts via Hermes (run ${result.runId.slice(0, 8)}). Live gabriel:daily untouched.`)
}

main().catch((e) => { console.error('FATAL:', e); process.exit(1) })
