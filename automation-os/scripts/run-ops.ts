#!/usr/bin/env ts-node
/**
 * run-ops.ts — Admin/ops sweep through the Hermes mesh (Phase 4).
 * Schedule via launchd/cron. Runs system-health, error-review, automation-audit,
 * and crm-hygiene (report-only). Pass --apply to let crm-hygiene archive stale leads.
 *   npm run ops:admin
 *   npm run ops:admin -- --apply
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

async function main() {
  registerMeshAgents()
  const apply = process.argv.includes('--apply')
  console.log(`\n🩺 Ops sweep — ${new Date().toISOString()}\n`)

  const health = await runAgent<{ ok: boolean; adapters: Array<{ name: string; status: string }> }>('admin.system-health', {})
  console.log(`Health: ${health.output!.ok ? '✅ all critical ok' : '⚠ issues'}`)
  for (const a of health.output!.adapters) console.log(`  ${a.status === 'ok' ? '✓' : a.status === 'absent' ? '·' : '✗'} ${a.name}: ${a.status}`)

  const audit = await runAgent<{ totalRuns: number; successRate: number; errors: number; topAgents: Array<{ agent: string; count: number }>; avgLatencyMs: number }>('admin.automation-audit', {})
  console.log(`\nAudit: ${audit.output!.totalRuns} runs · ${audit.output!.successRate}% ok · ${audit.output!.errors} errors · avg ${audit.output!.avgLatencyMs}ms`)
  console.log(`  Top: ${audit.output!.topAgents.map((t) => `${t.agent}(${t.count})`).join(', ')}`)

  const err = await runAgent<{ errorCount: number; byAgent: Record<string, number>; circuitOpens: number }>('admin.error-review', { sinceHours: 24 })
  console.log(`\nErrors (24h): ${err.output!.errorCount} · circuit-opens: ${err.output!.circuitOpens}`)
  if (err.output!.errorCount) console.log(`  By agent: ${Object.entries(err.output!.byAgent).map(([a, n]) => `${a}:${n}`).join(', ')}`)

  const crm = await runAgent<{ staleCount: number; archived: number }>('admin.crm-hygiene', { staleDays: 90, apply })
  console.log(`\nCRM hygiene: ${crm.output!.staleCount} stale leads (>90d)${apply ? ` · archived ${crm.output!.archived}` : ' · report-only (use --apply to archive)'}`)

  console.log(`\n✅ Ops sweep complete.\n`)
}

main().catch((e) => { console.error('FATAL:', e); process.exit(1) })
