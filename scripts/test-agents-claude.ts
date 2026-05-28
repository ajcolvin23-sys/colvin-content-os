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

import { runSolomon } from '@/lib/agents/solomon'
import { runGabriel } from '@/lib/agents/gabriel'

async function main() {
  console.log('=== Testing Solomon (Claude Opus 4.7) ===')
  const sol = await runSolomon('In 50 words: what is the strongest local SEO move for Indiana Backflow Directory?')
  console.log('Success:', sol.success)
  console.log('Output preview:', sol.output.slice(0, 200))
  if (sol.error) console.log('Error:', sol.error)

  console.log('\n=== Testing Gabriel (Claude Sonnet 4.6) ===')
  const gab = await runGabriel('Write one LinkedIn hook line about manual work draining payroll. 12 words max.')
  console.log('Success:', gab.success)
  console.log('Output:', gab.output)
  if (gab.error) console.log('Error:', gab.error)
}

main().catch(e => { console.error('FAIL:', e.message); process.exit(1) })
