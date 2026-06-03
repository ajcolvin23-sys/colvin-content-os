#!/usr/bin/env ts-node
/** run-supervisor.ts — Hermes Supervisor sweep (Phase 5). npm run ops:supervise */
import * as fs from 'fs'
import * as path from 'path'
const ROOT = path.resolve(__dirname, '../..')
;(() => {
  const p = path.join(ROOT, '.env.local'); if (!fs.existsSync(p)) return
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const t = line.trim(); if (!t || t.startsWith('#')) continue
    const i = t.indexOf('='); if (i < 0) continue
    const k = t.slice(0, i).trim(), v = t.slice(i + 1).trim(); if (!process.env[k]) process.env[k] = v
  }
})()
import { supervise } from '../../lib/hermes/supervisor'

async function main() {
  const s = await supervise()
  console.log(`\n${s.healthy ? '✅ HEALTHY' : '⚠ ATTENTION'} — ${s.at}`)
  console.log(`  Audit: ${s.audit.totalRuns} runs · ${s.audit.successRate}% ok · ${s.audit.errors} errors · avg ${s.audit.avgLatencyMs}ms`)
  console.log(`  Errors(24h): ${s.errors24h.errorCount} · circuit-opens: ${s.errors24h.circuitOpens}`)
  console.log(`  Adapters: ${s.adapters.filter(a => a.status === 'ok').length}/${s.adapters.length} ok`)
  console.log(`  Breakers: ${s.breakers.filter(b => b.open).length} open / ${s.breakers.length} tracked`)
  if (s.alerts.length) s.alerts.forEach(a => console.log(`  ⚠ ${a}`))
  console.log('')
}
main().catch((e) => { console.error('FATAL:', e); process.exit(1) })
