// ─── Hermes Health Check ──────────────────────────────────────────────────────
// Verifies all APIs and MCPs the orchestrator depends on are reachable.
// Run: npm run health-check
// ─────────────────────────────────────────────────────────────────────────────

import OpenAI from 'openai'

export interface HealthResult {
  service: string
  status: 'ok' | 'error' | 'warn'
  message: string
  latency_ms?: number
}

// ── OpenAI ────────────────────────────────────────────────────────────────────
async function checkOpenAI(): Promise<HealthResult> {
  const start = Date.now()
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const res = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'Reply with the single word: ONLINE' }],
      max_tokens: 5,
      temperature: 0,
    })
    const reply = res.choices[0].message.content?.trim()
    const latency_ms = Date.now() - start
    if (reply?.includes('ONLINE')) {
      return { service: 'OpenAI gpt-4o', status: 'ok', message: 'Responding', latency_ms }
    }
    return { service: 'OpenAI gpt-4o', status: 'warn', message: `Unexpected reply: ${reply}`, latency_ms }
  } catch (err) {
    return { service: 'OpenAI gpt-4o', status: 'error', message: String(err) }
  }
}

// ── Supabase ──────────────────────────────────────────────────────────────────
async function checkSupabase(): Promise<HealthResult> {
  const start = Date.now()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    return { service: 'Supabase', status: 'error', message: 'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' }
  }
  try {
    const res = await fetch(`${url}/rest/v1/content_items?limit=1`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
    })
    const latency_ms = Date.now() - start
    if (res.ok) {
      return { service: 'Supabase', status: 'ok', message: `HTTP ${res.status}`, latency_ms }
    }
    const body = await res.text()
    return { service: 'Supabase', status: 'error', message: `HTTP ${res.status}: ${body.slice(0, 120)}`, latency_ms }
  } catch (err) {
    return { service: 'Supabase', status: 'error', message: String(err) }
  }
}

// ── Telegram Bot ──────────────────────────────────────────────────────────────
async function checkTelegram(): Promise<HealthResult> {
  const start = Date.now()
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) {
    return { service: 'Telegram Bot', status: 'warn', message: 'TELEGRAM_BOT_TOKEN not set — notifications disabled' }
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getMe`)
    const latency_ms = Date.now() - start
    if (res.ok) {
      const data = await res.json() as { result?: { username?: string } }
      return { service: 'Telegram Bot', status: 'ok', message: `Bot: @${data.result?.username}`, latency_ms }
    }
    return { service: 'Telegram Bot', status: 'error', message: `HTTP ${res.status}`, latency_ms }
  } catch (err) {
    return { service: 'Telegram Bot', status: 'error', message: String(err) }
  }
}

// ── Composio / Google Drive ───────────────────────────────────────────────────
async function checkComposio(): Promise<HealthResult> {
  // Composio is now OPTIONAL — video files are delivered via Telegram sendDocument instead
  // Only used if COMPOSIO_API_KEY is set and a Drive folder ID is configured
  const start = Date.now()
  const key = process.env.COMPOSIO_API_KEY
  if (!key) {
    return { service: 'Composio (Google Drive)', status: 'warn', message: 'COMPOSIO_API_KEY not set — Drive video uploads disabled' }
  }
  try {
    // Composio v3 — try the toolkits endpoint as a lightweight auth check
    const res = await fetch('https://backend.composio.dev/api/v3/toolkits?limit=1', {
      headers: { 'x-api-key': key, 'Content-Type': 'application/json' },
    })
    const latency_ms = Date.now() - start
    if (res.ok) {
      return { service: 'Composio (Google Drive)', status: 'ok', message: `HTTP ${res.status}`, latency_ms }
    }
    // 404 means Composio API structure may have changed again — warn but don't block
    return {
      service: 'Composio (Google Drive)',
      status: 'warn',
      message: `HTTP ${res.status} — Drive uploads unavailable, but videos are delivered via Telegram instead ✓`,
      latency_ms,
    }
  } catch (err) {
    return { service: 'Composio (Google Drive)', status: 'warn', message: `Composio unreachable — video Drive uploads will fail until key is refreshed` }
  }
}

// ── Orchestrator Self-Audit ───────────────────────────────────────────────────
// Checks the orchestrator TypeScript file for required components
import * as fs from 'fs'
import * as path from 'path'

function checkOrchestratorIntegrity(): HealthResult[] {
  const results: HealthResult[] = []
  const orchPath = path.resolve(__dirname, '../orchestrator.ts')

  if (!fs.existsSync(orchPath)) {
    return [{ service: 'Orchestrator File', status: 'error', message: 'orchestrator.ts not found' }]
  }

  const src = fs.readFileSync(orchPath, 'utf8')

  const checks: Array<{ name: string; pattern: string | RegExp; required: boolean }> = [
    { name: 'PLANNER_PROMPT defined', pattern: 'PLANNER_PROMPT', required: true },
    { name: 'PROMPT_BUILDER_SYSTEM defined', pattern: 'PROMPT_BUILDER_SYSTEM', required: true },
    { name: 'buildGeniusPrompt function', pattern: 'buildGeniusPrompt', required: true },
    { name: 'buildHandoffSummary function', pattern: 'buildHandoffSummary', required: true },
    { name: 'runQACritic function', pattern: 'runQACritic', required: true },
    { name: 'runKatrinaReview function', pattern: 'runKatrinaReview', required: true },
    { name: 'buildMemorySaveRecommendation function', pattern: 'buildMemorySaveRecommendation', required: true },
    { name: 'KATRINA_TRIGGERS defined', pattern: 'KATRINA_TRIGGERS', required: true },
    { name: 'needsKatrinaReview function', pattern: 'needsKatrinaReview', required: true },
    { name: 'Failure retry logic', pattern: 'RETRY', required: true },
    { name: 'All 9 business lanes in PLANNER', pattern: 'funding_ready_indiana', required: true },
    { name: 'FundingReady compliance rule', pattern: 'FundingReady', required: true },
    { name: 'First Keys compliance rule', pattern: 'up to $X', required: true },
    { name: 'Backflow compliance rule', pattern: 'educational only', required: true },
    { name: 'Evidence labels in PROMPT_BUILDER', pattern: 'VERIFIED', required: true },
    { name: 'assembleFinalOutput function', pattern: 'assembleFinalOutput', required: true },
    { name: 'Phase 6 memory save', pattern: 'Phase 6', required: true },
    { name: 'runOrchestrator exported', pattern: 'export async function runOrchestrator', required: true },
  ]

  for (const check of checks) {
    const found = typeof check.pattern === 'string'
      ? src.includes(check.pattern)
      : check.pattern.test(src)

    results.push({
      service: `Orchestrator: ${check.name}`,
      status: found ? 'ok' : (check.required ? 'error' : 'warn'),
      message: found ? 'Present' : (check.required ? 'MISSING — needs fix' : 'Not found'),
    })
  }

  return results
}

// ── Registry File Check ───────────────────────────────────────────────────────
function checkRegistryFiles(): HealthResult[] {
  const results: HealthResult[] = []
  const base = path.resolve(__dirname, '../../../..')

  const expectedFiles = [
    'Colvin-Hermes-Workspace/hermes-prime/docs/agent-os/orchestrator/ORCHESTRATOR_CORE.md',
    'Colvin-Hermes-Workspace/hermes-prime/docs/agent-os/orchestrator/AGENT_REGISTRY.md',
    'Colvin-Hermes-Workspace/hermes-prime/docs/agent-os/orchestrator/SKILL_REGISTRY.md',
    'Colvin-Hermes-Workspace/hermes-prime/docs/agent-os/orchestrator/ROUTING_MATRIX.md',
    'Colvin-Hermes-Workspace/hermes-prime/docs/agent-os/orchestrator/KATRINA_GATE_RULES.md',
    'Colvin-Hermes-Workspace/hermes-prime/docs/agent-os/orchestrator/QA_CRITIC_GATE_RULES.md',
    'Colvin-Hermes-Workspace/hermes-prime/docs/agent-os/orchestrator/REGISTRY_UPDATE_PROTOCOL.md',
    'Colvin-Hermes-Workspace/hermes-prime/docs/agent-os/ALFRED_GENIUS_OS_BIG_PICTURE_CONTEXT.md',
    'Colvin-Hermes-Workspace/hermes-prime/docs/agent-os/prompts/GENIUS_PROMPT_PATTERN_LIBRARY.md',
    'Colvin-Hermes-Workspace/hermes-prime/docs/agent-os/protocols/STRUCTURED_HANDOFF_TEMPLATE.md',
    'Colvin-Hermes-Workspace/hermes-prime/docs/agent-os/protocols/FAILURE_RECOVERY_PROTOCOL.md',
    'Colvin-Hermes-Workspace/hermes-prime/docs/agent-os/protocols/KATRINA_GATE_RULES.md',
    'Colvin-Hermes-Workspace/hermes-prime/docs/agent-os/protocols/SELF_IMPROVEMENT_PROTOCOL.md',
  ]

  for (const rel of expectedFiles) {
    // Search from /Users/katrinacolvin
    const full = path.join('/Users/katrinacolvin', rel)
    const exists = fs.existsSync(full)
    results.push({
      service: `Registry file: ${path.basename(rel)}`,
      status: exists ? 'ok' : 'error',
      message: exists ? full : `NOT FOUND at ${full}`,
    })
  }

  return results
}

// ── Firecrawl MCP ─────────────────────────────────────────────────────────────
async function checkFirecrawl(): Promise<HealthResult> {
  const start = Date.now()
  const key = process.env.FIRECRAWL_API_KEY
  if (!key) {
    return { service: 'Firecrawl MCP', status: 'warn', message: 'FIRECRAWL_API_KEY not set — web scraping disabled for Solomon' }
  }
  try {
    // Lightweight test: scrape example.com
    const res = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com', formats: ['markdown'] }),
    })
    const latency_ms = Date.now() - start
    if (res.ok) {
      const data = await res.json() as { success?: boolean; data?: { metadata?: { creditsUsed?: number } } }
      const credits = data?.data?.metadata?.creditsUsed ?? '?'
      return { service: 'Firecrawl MCP', status: 'ok', message: `Scraping active — credits used this call: ${credits}`, latency_ms }
    }
    const body = await res.text()
    return { service: 'Firecrawl MCP', status: 'error', message: `HTTP ${res.status}: ${body.slice(0, 100)}`, latency_ms }
  } catch (err) {
    return { service: 'Firecrawl MCP', status: 'error', message: String(err) }
  }
}

// ── Playwright MCP ────────────────────────────────────────────────────────────
async function checkPlaywright(): Promise<HealthResult> {
  try {
    // Check if @playwright/mcp package is resolvable — spawn a version check
    const { execSync } = await import('child_process')
    const output = execSync('npx @playwright/mcp@latest --version 2>&1', { timeout: 15000 }).toString().trim()
    return { service: 'Playwright MCP', status: 'ok', message: `Package available: ${output}` }
  } catch {
    return { service: 'Playwright MCP', status: 'warn', message: 'Package not cached locally — first use will auto-install via npx (normal)' }
  }
}

// ── Remotion MCP ──────────────────────────────────────────────────────────────
async function checkRemotionMCP(): Promise<HealthResult> {
  const start = Date.now()
  const url = 'https://still-feather-l5mwy.run.mcp-use.com/mcp'
  try {
    const res = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(8000) })
    const latency_ms = Date.now() - start
    if (res.ok || res.status === 405) {
      // 405 = Method Not Allowed is normal for an MCP endpoint hit with plain GET
      return { service: 'Remotion MCP', status: 'ok', message: `Endpoint reachable (HTTP ${res.status})`, latency_ms }
    }
    return { service: 'Remotion MCP', status: 'warn', message: `HTTP ${res.status} — may still work for video rendering`, latency_ms }
  } catch (err) {
    return { service: 'Remotion MCP', status: 'warn', message: `Endpoint unreachable — video rendering via MCP may be down` }
  }
}

// ── Gemini MCP (hermes-prime) ─────────────────────────────────────────────────
async function checkGeminiMCP(): Promise<HealthResult> {
  const serverPath = '/Users/katrinacolvin/Colvin-Hermes-Workspace/hermes-prime/dist/mcp-server/gemini-server.js'
  const envPath = '/Users/katrinacolvin/Colvin-Hermes-Workspace/hermes-prime/.env'

  if (!fs.existsSync(serverPath)) {
    return { service: 'Gemini MCP', status: 'error', message: `gemini-server.js not found — run: cd hermes-prime && npm run build` }
  }

  // Check .env has GOOGLE_API_KEY
  let hasKey = !!process.env.GOOGLE_API_KEY
  if (!hasKey && fs.existsSync(envPath)) {
    hasKey = fs.readFileSync(envPath, 'utf8').includes('GOOGLE_API_KEY=')
  }
  if (!hasKey) {
    return { service: 'Gemini MCP', status: 'warn', message: 'Server built but GOOGLE_API_KEY not set in hermes-prime/.env' }
  }

  // Quick Gemini API ping
  const start = Date.now()
  const apiKey = process.env.GOOGLE_API_KEY
  if (apiKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: 'Reply: ONLINE' }] }] }),
          signal: AbortSignal.timeout(10000),
        }
      )
      const latency_ms = Date.now() - start
      if (res.ok) return { service: 'Gemini MCP', status: 'ok', message: `Server built + Gemini API responding`, latency_ms }
      return { service: 'Gemini MCP', status: 'warn', message: `Server built, Gemini API HTTP ${res.status}`, latency_ms }
    } catch {
      return { service: 'Gemini MCP', status: 'warn', message: 'Server built, Gemini API unreachable — check GOOGLE_API_KEY' }
    }
  }

  return { service: 'Gemini MCP', status: 'ok', message: 'Server built, GOOGLE_API_KEY present in hermes-prime/.env' }
}

// ── Social Platform API Keys ──────────────────────────────────────────────────
function checkSocialPlatforms(): HealthResult[] {
  const platforms = [
    { name: 'TikTok', keys: ['TIKTOK_CLIENT_KEY', 'TIKTOK_CLIENT_SECRET'] },
    { name: 'YouTube', keys: ['YOUTUBE_CLIENT_ID', 'YOUTUBE_CLIENT_SECRET'] },
    { name: 'Facebook', keys: ['FACEBOOK_APP_ID', 'FACEBOOK_APP_SECRET', 'FACEBOOK_PAGE_ID'] },
    { name: 'LinkedIn', keys: ['LINKEDIN_CLIENT_ID', 'LINKEDIN_CLIENT_SECRET'] },
  ]

  // Load from .env.local if not already in env
  const envPath = path.resolve(__dirname, '../../../.env.local')
  const envVars: Record<string, string> = {}
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
      const t = line.trim()
      if (!t || t.startsWith('#')) continue
      const idx = t.indexOf('=')
      if (idx < 0) continue
      envVars[t.slice(0, idx).trim()] = t.slice(idx + 1).trim()
    }
  }

  return platforms.map(p => {
    const missing = p.keys.filter(k => !process.env[k] && !envVars[k])
    if (missing.length === 0) {
      return { service: `Social: ${p.name}`, status: 'ok' as const, message: `${p.keys.length} key(s) configured` }
    }
    return {
      service: `Social: ${p.name}`,
      status: 'warn' as const,
      message: `Missing: ${missing.join(', ')} — publishing to ${p.name} will fail`,
    }
  })
}

// ── Main Health Check Runner ──────────────────────────────────────────────────
export async function runHealthCheck(): Promise<HealthResult[]> {
  const [openai, supabase, telegram, composio, firecrawl, playwright, remotion, gemini] = await Promise.all([
    checkOpenAI(),
    checkSupabase(),
    checkTelegram(),
    checkComposio(),
    checkFirecrawl(),
    checkPlaywright(),
    checkRemotionMCP(),
    checkGeminiMCP(),
  ])

  const socialResults = checkSocialPlatforms()
  const orchestratorResults = checkOrchestratorIntegrity()
  const registryResults = checkRegistryFiles()

  return [
    openai, supabase, telegram, composio,
    firecrawl, playwright, remotion, gemini,
    ...socialResults,
    ...orchestratorResults,
    ...registryResults,
  ]
}

export function printHealthReport(results: HealthResult[]): void {
  const icons = { ok: '✅', warn: '⚠️ ', error: '❌' }
  const byStatus = { ok: 0, warn: 0, error: 0 }

  console.log('\n🔍  HERMES HEALTH CHECK\n')
  console.log('─'.repeat(70))

  for (const r of results) {
    byStatus[r.status]++
    const latency = r.latency_ms ? ` (${r.latency_ms}ms)` : ''
    console.log(`${icons[r.status]} ${r.service}: ${r.message}${latency}`)
  }

  console.log('─'.repeat(70))
  console.log(`\n✅ OK: ${byStatus.ok}  ⚠️  WARN: ${byStatus.warn}  ❌ ERROR: ${byStatus.error}`)

  if (byStatus.error > 0) {
    console.log('\n🚨 SYSTEM NOT READY — fix errors above before running orchestrator\n')
  } else if (byStatus.warn > 0) {
    console.log('\n⚠️  SYSTEM OPERATIONAL WITH WARNINGS — some features may be unavailable\n')
  } else {
    console.log('\n🟢 ALL SYSTEMS GREEN — orchestrator is ready\n')
  }
}
