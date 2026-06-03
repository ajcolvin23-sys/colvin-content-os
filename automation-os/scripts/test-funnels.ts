#!/usr/bin/env ts-node
/**
 * test-funnels.ts — Phase 3 (Funnels group + compliance gate).
 *   npm run test:funnels
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

import { registerMeshAgents } from '../../lib/hermes/agents'
import { runAgent } from '../../lib/hermes'
import { buildFunnel } from '../../lib/hermes/agents/funnels'

async function main() {
  registerMeshAgents()

  // gate.compliance — deterministic
  const clean = await runAgent<{ passed: boolean; risk_level: string; issues: string[] }>('gate.compliance', { text: 'We help Indianapolis churches automate visitor follow-up. Book a free workshop.' })
  const bad = await runAgent<{ passed: boolean; risk_level: string }>('gate.compliance', { text: 'Guaranteed approval! Earn $10,000 in revenue with no risk — act now!' })
  const gateOk = clean.output!.passed && clean.output!.risk_level === 'low' && !bad.output!.passed && bad.output!.risk_level === 'high'
  console.log(`gate.compliance → clean=${clean.output!.risk_level} bad=${bad.output!.risk_level}  ${gateOk ? '✓' : '✗'}`)

  // funnel.builder — full funnel for one lane (6 LLM calls)
  console.log('\nBuilding full funnel for colvin_enterprises...')
  const funnel = await buildFunnel({
    lane: 'colvin_enterprises',
    transformation: 'Reclaim hours burned on robot work without hiring',
    audience: 'small businesses, churches, nonprofits',
    painPoint: 'manual scheduling, data entry, follow-up',
  })
  const lm = funnel.leadMagnet as { type: string; title: string } | undefined
  const lp = funnel.landingPage as { sections: unknown[] } | undefined
  const nu = funnel.nurture as { emails: unknown[] } | undefined
  const form = funnel.form as { fields: unknown[] } | undefined
  console.log(`  lead magnet: ${lm?.type} — "${lm?.title}"`)
  console.log(`  landing page: ${lp?.sections.length ?? 0} sections`)
  console.log(`  intake form: ${form?.fields.length ?? 0} fields`)
  console.log(`  nurture: ${nu?.emails.length ?? 0} emails`)
  const funnelOk = funnel.ok && !!lm?.title && (lp?.sections.length ?? 0) > 0 && (nu?.emails.length ?? 0) > 0

  // conversion audit on the assembled landing page
  const audit = await runAgent<{ score: number; recommendations: string[] }>('funnel.conversion-audit', {
    funnelDescription: `Lead magnet: ${lm?.title}. Landing sections: ${(lp?.sections ?? []).length}. Form fields: ${(form?.fields ?? []).length}.`,
  })
  console.log(`  conversion audit: score ${audit.output!.score}/10, ${audit.output!.recommendations.length} recs`)

  const pass = gateOk && funnelOk && audit.ok
  console.log(`\n${pass ? '✅ PHASE 3 (Funnels + compliance) PASS' : '❌ FAILED'} — full funnel built through Hermes.`)
  if (!pass) process.exit(1)
}

main().catch((e) => { console.error('FATAL:', e); process.exit(1) })
