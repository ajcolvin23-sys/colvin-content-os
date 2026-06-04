// ─── Hermes Agent Runner ────────────────────────────────────────────────────
// The ONLY way an agent is invoked. Responsibilities:
//   1. Validate input against the agent's JSON Schema (AJV).
//   2. Run the agent with retries + exponential backoff.
//   3. Validate output against the agent's JSON Schema.
//   4. Trip a per-agent circuit breaker after repeated failures.
//   5. Log every run (Supabase `agent_runs`, best-effort) + local JSONL fallback,
//      so observability works even with no DB.

import Ajv, { type ValidateFunction } from 'ajv'
import * as fs from 'fs'
import * as path from 'path'
import { randomUUID } from 'crypto'
import { getAgent } from './registry'
import type { AgentContext, AgentRunResult, JsonSchema } from './types'

const ajv = new Ajv({ allErrors: true, strict: false })
const validators = new WeakMap<JsonSchema, ValidateFunction>()

function compile(schema: JsonSchema): ValidateFunction {
  let v = validators.get(schema)
  if (!v) {
    v = ajv.compile(schema)
    validators.set(schema, v)
  }
  return v
}

function validate(schema: JsonSchema | undefined, data: unknown, where: string): void {
  if (!schema) return
  const v = compile(schema)
  if (!v(data)) {
    const msg = (v.errors ?? []).map((e) => `${e.instancePath || '/'} ${e.message}`).join('; ')
    throw new Error(`${where} schema validation failed: ${msg}`)
  }
}

// ─── Circuit breaker ────────────────────────────────────────────────────────
const FAILURE_THRESHOLD = 4
const OPEN_MS = 60_000
interface Breaker { failures: number; openUntil: number }
const breakers = new Map<string, Breaker>()

function breakerFor(name: string): Breaker {
  let b = breakers.get(name)
  if (!b) { b = { failures: 0, openUntil: 0 }; breakers.set(name, b) }
  return b
}

// ─── Run logging (best-effort) ──────────────────────────────────────────────
const LOG_DIR = path.resolve(process.cwd(), 'logs')
const LOG_FILE = path.join(LOG_DIR, 'agent_runs.jsonl')

async function logRun(row: Record<string, unknown>): Promise<void> {
  // Local JSONL — always works.
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true })
    fs.appendFileSync(LOG_FILE, JSON.stringify(row) + '\n')
  } catch { /* non-fatal */ }
  // Supabase — best-effort; never blocks or fails the agent.
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabase = createAdminClient()
    await supabase.from('agent_runs').insert(row)
  } catch { /* table may not exist yet / no service key — fine */ }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export interface RunOptions {
  runId?: string
  lane?: string
  dryRun?: boolean
  parent?: string
}

export async function runAgent<O = unknown>(
  name: string,
  input: unknown,
  opts: RunOptions = {},
): Promise<AgentRunResult<O>> {
  const runId = opts.runId ?? randomUUID()
  const agent = getAgent(name)
  const maxRetries = agent.maxRetries ?? 2
  const startedAt = Date.now()

  const ctx: AgentContext = {
    runId,
    lane: opts.lane,
    dryRun: opts.dryRun,
    parent: opts.parent,
    log: (msg: string) => console.log(`  [${name}:${runId.slice(0, 8)}] ${msg}`),
  }

  // Circuit open?
  const breaker = breakerFor(name)
  if (Date.now() < breaker.openUntil) {
    const result: AgentRunResult<O> = {
      agent: name, runId, ok: false, attempts: 0, latencyMs: 0, circuitOpen: true,
      error: `circuit open for ${name} (${breaker.failures} recent failures) — retry after ${new Date(breaker.openUntil).toISOString()}`,
    }
    await logRun({ run_id: runId, agent: name, lane: opts.lane ?? null, status: 'circuit_open', attempts: 0, latency_ms: 0, error: result.error, created_at: new Date().toISOString() })
    return result
  }

  // Validate input ONCE up front. A bad input is a caller error — fail fast,
  // don't retry (it can never succeed) and don't count it against the breaker.
  try {
    validate(agent.inputSchema, input, `${name} input`)
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    const latencyMs = Date.now() - startedAt
    await logRun({ run_id: runId, agent: name, lane: opts.lane ?? null, status: 'error', attempts: 0, latency_ms: latencyMs, error, parent: opts.parent ?? null, created_at: new Date().toISOString() })
    return { agent: name, runId, ok: false, error, attempts: 0, latencyMs }
  }

  let lastError = ''
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const output = await agent.run(input, ctx)
      validate(agent.outputSchema, output, `${name} output`)

      const latencyMs = Date.now() - startedAt
      breaker.failures = 0 // success resets the breaker
      await logRun({
        run_id: runId, agent: name, lane: opts.lane ?? null, status: 'ok',
        attempts: attempt, latency_ms: latencyMs, parent: opts.parent ?? null,
        created_at: new Date().toISOString(),
      })
      return { agent: name, runId, ok: true, output: output as O, attempts: attempt, latencyMs }
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err)
      ctx.log(`attempt ${attempt} failed: ${lastError.slice(0, 160)}`)
      if (attempt <= maxRetries) await sleep(300 * 2 ** (attempt - 1))
    }
  }

  // All attempts failed → record failure + maybe open breaker.
  breaker.failures += 1
  if (breaker.failures >= FAILURE_THRESHOLD) breaker.openUntil = Date.now() + OPEN_MS
  const latencyMs = Date.now() - startedAt
  await logRun({
    run_id: runId, agent: name, lane: opts.lane ?? null, status: 'error',
    attempts: maxRetries + 1, latency_ms: latencyMs, error: lastError,
    parent: opts.parent ?? null, created_at: new Date().toISOString(),
  })
  return { agent: name, runId, ok: false, error: lastError, attempts: maxRetries + 1, latencyMs }
}

/** Test/dev only — clears circuit breaker state. */
export function _resetBreakers(): void { breakers.clear() }

/** Snapshot of every circuit breaker (for the Supervisor / dashboard). */
export function getBreakerStates(): Array<{ agent: string; failures: number; open: boolean; openUntil: number }> {
  const now = Date.now()
  return [...breakers.entries()].map(([agent, b]) => ({ agent, failures: b.failures, open: now < b.openUntil, openUntil: b.openUntil }))
}
