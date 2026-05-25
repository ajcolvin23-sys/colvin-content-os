// Test script for the Hermes Orchestrator v2
// Run: npm run orchestrator "your request here"

import * as fs from 'fs'
import * as path from 'path'

// Load .env.local
const envPath = path.resolve(__dirname, '../.env.local')
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

// Import must happen AFTER env is loaded
async function main() {
  const { runOrchestrator } = await import('../lib/agents/orchestrator')

  const request = process.argv[2] ||
    'Write a Facebook post about the first-generation homebuyer program for First Keys Indy'

  console.log('\n🧠  Hermes Orchestrator v2\n')
  console.log('Request:', request)
  console.log('─'.repeat(60))

  const result = await runOrchestrator(request)

  console.log('\n📋 PLAN')
  console.log('  Intent:', result.plan.intent)
  console.log('  Lane:', result.plan.lane)
  console.log('  Agents:', result.agents_used.join(' → '))
  console.log('  Steps:', result.plan.steps.length)
  console.log('  Time:', result.execution_time_ms + 'ms')
  console.log('  Reasoning:', result.plan.reasoning)

  console.log('\n' + '═'.repeat(60))
  console.log('✅  FINAL OUTPUT')
  console.log('═'.repeat(60))
  console.log(result.final_output)
  console.log('\n' + '─'.repeat(60))
  console.log(`⏱  Total: ${result.execution_time_ms}ms`)
}

main().catch(err => { console.error('Error:', err); process.exit(1) })
