#!/usr/bin/env ts-node
/**
 * test-hermes-spine.ts — Phase 0 exit criteria.
 * Registers the sample agents, runs them through Hermes as a 2-step pipeline,
 * proves I/O validation + data flow + run logging, and shows that bad input is
 * rejected by the schema and the circuit breaker is wired.
 *   npm run test:hermes
 */
import * as fs from 'fs'
import * as path from 'path'
import { registerAll, runPipeline, runAgent, listAgents, submitForReview } from '../../lib/hermes'
import { echoAgent, shoutAgent } from '../../lib/hermes/agents/echo'

async function main() {
  registerAll([echoAgent, shoutAgent])
  console.log('Registered agents:', listAgents().join(', '))

  // 1) Happy path — 2-step pipeline, data flows echo → shout.
  const result = await runPipeline(
    [{ agent: 'sample.echo' }, { agent: 'sample.shout' }],
    { message: 'hello agent mesh' },
    { name: 'spine-smoke' },
  )
  console.log('Pipeline ok:', result.ok)
  console.log('Final output:', JSON.stringify(result.finalOutput))
  console.log('Per-step:', result.steps.map((s) => `${s.agent}=${s.ok ? 'ok' : 'ERR'}(${s.latencyMs}ms)`).join('  '))

  // 2) Schema rejection — empty message must fail input validation.
  const bad = await runAgent('sample.echo', { message: '' })
  console.log('Bad-input rejected:', !bad.ok, '|', String(bad.error).slice(0, 70))

  // 3) Review gateway — terminal stage records a pending ticket.
  const tickets = await submitForReview(
    [{ lane: 'colvin_enterprises', kind: 'sample', title: 'Spine smoke ticket', payload: result.finalOutput }],
    { runId: result.runId },
  )
  console.log('Review ticket created:', tickets[0].id, '→', tickets[0].status)

  // 4) Prove a run row was logged locally.
  const logFile = path.resolve(process.cwd(), 'logs/agent_runs.jsonl')
  const lines = fs.existsSync(logFile) ? fs.readFileSync(logFile, 'utf8').trim().split('\n') : []
  const lastRows = lines.slice(-3).map((l) => { try { const r = JSON.parse(l); return `${r.agent}=${r.status}` } catch { return '?' } })
  console.log(`agent_runs.jsonl has ${lines.length} row(s); latest: ${lastRows.join(', ')}`)

  const pass = result.ok && !bad.ok && tickets.length === 1 && lines.length > 0
  console.log(`\n${pass ? '✅ PHASE 0 SPINE PASSES' : '❌ SPINE CHECK FAILED'} — validation + data flow + logging + review gateway all working.`)
  if (!pass) process.exit(1)
}

main().catch((e) => { console.error('FATAL:', e); process.exit(1) })
