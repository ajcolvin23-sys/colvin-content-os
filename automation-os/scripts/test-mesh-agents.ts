#!/usr/bin/env ts-node
/**
 * test-mesh-agents.ts — Phase 2 batch 1.
 * Registers all mesh agents and runs the promoted deterministic steps
 * (leads.scoring → leads.categorize) through Hermes, proving they behave
 * identically to gabriel:daily steps 9 & 10 and are observable.
 *   npm run test:mesh
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

import { registerMeshAgents, ALL_AGENTS } from '../../lib/hermes/agents'
import { runAgent, listAgents } from '../../lib/hermes'

async function main() {
  registerMeshAgents()
  console.log(`Registered ${ALL_AGENTS.length} mesh agents:`)
  console.log('  ' + listAgents().join('\n  '))

  // leads.scoring — filter <5, sort desc (gabriel:daily step 9 parity)
  const leads = [
    { company: 'A', qualification_score: 8 },
    { company: 'B', qualification_score: 3 },
    { company: 'C', qualification_score: 6 },
    { company: 'D', qualification_score: 9 },
  ]
  const scored = await runAgent<{ scored: Array<{ company: string; qualification_score: number }> }>('leads.scoring', { leads })
  const order = scored.output!.scored.map((l) => `${l.company}:${l.qualification_score}`).join(', ')
  const scoringOk = scored.ok && scored.output!.scored.length === 3 && order === 'D:9, A:8, C:6'
  console.log(`\nleads.scoring → [${order}]  ${scoringOk ? '✓ parity' : '✗ MISMATCH'}`)

  // leads.categorize — outreach priority>=7 only (step 10 parity)
  const cat = await runAgent<{ outreach: unknown[]; content: unknown[]; seo: unknown[] }>('leads.categorize', {
    outreach: [{ priority_score: 9 }, { priority_score: 5 }, { priority_score: 7 }],
    content: [{ x: 1 }, { x: 2 }],
    seo: ['kw1'],
  })
  const catOk = cat.ok && cat.output!.outreach.length === 2 && cat.output!.content.length === 2
  console.log(`leads.categorize → ${cat.output!.outreach.length} outreach / ${cat.output!.content.length} content  ${catOk ? '✓ parity' : '✗ MISMATCH'}`)

  // leads.dedup — passthrough when no DB (parity with step 8's try/catch fallback)
  const dedup = await runAgent<{ unique: unknown[]; removed: number }>('leads.dedup', {
    leads: [{ company: 'X', linkedin_url: 'u1' }, { company: 'Y' }],
  })
  const dedupOk = dedup.ok && Array.isArray(dedup.output!.unique)
  console.log(`leads.dedup → ${dedup.output!.unique.length} unique / ${dedup.output!.removed} removed  ${dedupOk ? '✓' : '✗'}`)

  // report.daily — deterministic summary assembly (step 13 parity)
  const rep = await runAgent<{ summary: { leads_found: number; leads_queued_for_review: number } }>('report.daily', {
    rawLeadsCount: 6, uniqueLeadsCount: 4,
    outreach: [{ priority_score: 9 }, { priority_score: 5 }], contentCount: 5, seoCount: 0,
  })
  const repOk = rep.ok && rep.output!.summary.leads_found === 6 && rep.output!.summary.leads_queued_for_review === 1
  console.log(`report.daily → ${rep.output!.summary.leads_found} leads / ${rep.output!.summary.leads_queued_for_review} queued  ${repOk ? '✓ parity' : '✗ MISMATCH'}`)

  // daily-leads pipeline — dedup → scoring composed through Hermes
  const { runDailyLeadPipeline } = await import('../../lib/hermes/pipelines/daily-leads')
  const processed = await runDailyLeadPipeline([
    { company: 'P', qualification_score: 8, linkedin_url: 'lp' },
    { company: 'Q', qualification_score: 2 },
    { company: 'R', qualification_score: 7 },
  ])
  const pipeOk = processed.ok && processed.scored.length === 2 && Number(processed.scored[0].qualification_score) === 8
  console.log(`daily-leads pipeline → ${processed.scored.length} review-ready (top ${processed.scored[0]?.qualification_score})  ${pipeOk ? '✓' : '✗'}`)

  // outreach.email-copy — real LLM call, produces a review-only draft
  const email = await runAgent<{ subject: string; draft: string }>('outreach.email-copy', {
    lead: { name: 'Jane Doe', title: 'Operations Director', company: 'Acme Dental', lane: 'colvin_enterprises', fit_reason: 'manual scheduling + intake' },
    cta: 'Book a free 30-min workflow audit', ctaLink: 'https://calendar.app.google/x',
  })
  const emailOk = email.ok && email.output!.subject.length > 0 && email.output!.draft.length > 40
  console.log(`outreach.email-copy → subject "${email.output!.subject}" (${email.output!.draft.length} chars)  ${emailOk ? '✓' : '✗'}`)

  const logFile = path.resolve(process.cwd(), 'logs/agent_runs.jsonl')
  const rows = fs.existsSync(logFile) ? fs.readFileSync(logFile, 'utf8').trim().split('\n').length : 0
  console.log(`\nObservability: ${rows} total agent_runs logged.`)

  const pass = scoringOk && catOk && dedupOk && repOk && pipeOk
  console.log(`\n${pass ? '✅ PHASE 2 (batches 1–3) PASS' : '❌ FAILED'} — promoted steps + first real pipeline run through Hermes.`)
  if (!pass) process.exit(1)
}

main().catch((e) => { console.error('FATAL:', e); process.exit(1) })
