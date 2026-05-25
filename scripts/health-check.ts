// Run: npm run health-check

import * as fs from 'fs'
import * as path from 'path'

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

async function main() {
  const { runHealthCheck, printHealthReport } = await import('../lib/agents/utils/health-check')
  const results = await runHealthCheck()
  printHealthReport(results)

  const hasErrors = results.some(r => r.status === 'error')
  process.exit(hasErrors ? 1 : 0)
}

main().catch(err => { console.error('Health check failed:', err); process.exit(1) })
