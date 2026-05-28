import { callClaude, checkClaudeHealth } from '@/lib/ai/claude'
import { buildGabrielSystemPrelude } from '@/lib/agents/skill-loader'

async function main() {
  // Load .env.local
  const fs = await import('fs')
  const path = await import('path')
  const envPath = path.resolve(process.cwd(), '.env.local')
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

  console.log('=== TEST 1: Claude health check ===')
  const health = await checkClaudeHealth()
  console.log('Health:', health)

  console.log('\n=== TEST 2: Skill prelude loads ===')
  const prelude = buildGabrielSystemPrelude({ lane: 'colvin_enterprises' })
  console.log('Prelude length:', prelude.length, 'chars')
  console.log('Contains LOCKED UPGRADES:', prelude.includes('LOCKED UPGRADES'))
  console.log('Contains SAFETY:', prelude.includes('SAFETY'))
  console.log('Contains LANE COMPLIANCE:', prelude.includes('LANE COMPLIANCE'))

  console.log('\n=== TEST 3: Claude routing call ===')
  const result = await callClaude({
    taskType: 'routing_decisions',
    user: 'Reply with the single word "operational"',
    lane: 'colvin_enterprises',
    agentName: 'test',
  })
  console.log('Response:', result.text)
  console.log('Model used:', result.model)
  console.log('Input/Output tokens:', result.inputTokens, '/', result.outputTokens)
  console.log('Cost: $' + result.costUsd.toFixed(6))
  console.log('Latency:', result.latencyMs + 'ms')
}

main().catch(err => { console.error('FAIL:', err.message); process.exit(1) })
