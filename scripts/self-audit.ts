// Run: npm run self-audit

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
  const { runSelfAudit } = await import('../lib/agents/utils/self-audit')
  const report = await runSelfAudit(true)

  if (report.verdict === 'CRITICAL') {
    process.exit(1)
  }
}

main().catch(err => { console.error('Self-audit failed:', err); process.exit(1) })
