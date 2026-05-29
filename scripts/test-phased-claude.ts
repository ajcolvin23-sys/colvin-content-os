import * as fs from 'fs'
import * as path from 'path'
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim(); if (!t || t.startsWith('#')) continue
    const i = t.indexOf('='); if (i < 0) continue
    if (!process.env[t.slice(0, i).trim()]) process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim()
  }
}

import { runPhasedClaude } from '@/lib/ai/phased-claude'

async function main() {
  console.log('\n=== TEST 1: Colvin Enterprises LinkedIn hook (no compliance lane) ===\n')
  const r1 = await runPhasedClaude({
    taskType: 'content_generation',
    task: 'Write one LinkedIn hook line about manual data entry draining payroll budget. 12 words max. One sentence.',
    lane: 'colvin_enterprises',
  })
  console.log('FINAL OUTPUT:', r1.finalOutput)
  console.log('Phase 1 output:', r1.phase1Output)
  console.log('Triggers fired:', r1.triggersFired.length === 0 ? 'NONE' : r1.triggersFired)
  console.log('Skills loaded:', r1.skillsLoaded)
  console.log('Phases run:', r1.phasesRun.join(' → '))
  console.log('Cost: $' + r1.totalCostUsd.toFixed(6), '| Latency:', r1.totalLatencyMs + 'ms')

  console.log('\n=== TEST 2: First Keys Indy (compliance lane — should auto-append HUD line) ===\n')
  const r2 = await runPhasedClaude({
    taskType: 'content_generation',
    task: 'Write a Facebook hook about Marion County homebuyer down payment grant. 15 words max.',
    lane: 'first_keys_indy',
  })
  console.log('FINAL OUTPUT:', r2.finalOutput)
  console.log('Phase 1 output:', r2.phase1Output)
  console.log('Triggers fired:', r2.triggersFired.length === 0 ? 'NONE' : r2.triggersFired)
  console.log('Skills loaded:', r2.skillsLoaded)
  console.log('Phases run:', r2.phasesRun.join(' → '))
  console.log('Cost: $' + r2.totalCostUsd.toFixed(6), '| Latency:', r2.totalLatencyMs + 'ms')

  console.log('\n=== TEST 3: Deliberate hype prompt — should trigger compliance fix ===\n')
  const r3 = await runPhasedClaude({
    taskType: 'content_generation',
    task: 'Write a LinkedIn post promising businesses will save $5,000/month guaranteed with AI automation. Include 47% statistic.',
    lane: 'colvin_enterprises',
  })
  console.log('FINAL OUTPUT:', r3.finalOutput)
  console.log('Phase 1 output:', r3.phase1Output)
  console.log('Triggers fired:', r3.triggersFired.length === 0 ? 'NONE' : r3.triggersFired)
  console.log('Skills loaded:', r3.skillsLoaded)
  console.log('Phases run:', r3.phasesRun.join(' → '))
  console.log('Cost: $' + r3.totalCostUsd.toFixed(6), '| Latency:', r3.totalLatencyMs + 'ms')
}

main().catch(e => { console.error('FAIL:', e.message); process.exit(1) })
