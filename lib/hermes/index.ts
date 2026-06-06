// ─── Hermes Orchestrator ────────────────────────────────────────────────────
// Executes a pipeline: an ordered list of agent calls with typed data flow.
// Owns the run id, threads outputs between steps, supports per-agent
// enable/disable, and surfaces a single PipelineResult for observability.
//
// A pipeline replaces the hardcoded "step 1..16" runner: instead of one giant
// function, Hermes runs named agents in sequence. Each agent is independently
// testable, swappable, and logged via the runner.

import { randomUUID } from 'crypto'
import { runAgent, type RunOptions } from './runner'
import type { AgentRunResult, PipelineResult, PipelineStep } from './types'

export interface PipelineOptions extends Omit<RunOptions, 'runId' | 'parent'> {
  /** Reuse an existing run id (e.g. nested pipelines). */
  runId?: string
  /** Label for telemetry / call tree. */
  name?: string
}

/**
 * Run a sequence of agents. Each step receives the previous step's output by
 * default, or a custom slice via `step.map(acc, pipelineInput)`.
 */
export async function runPipeline(
  steps: PipelineStep[],
  pipelineInput: unknown,
  opts: PipelineOptions = {},
): Promise<PipelineResult> {
  const runId = opts.runId ?? randomUUID()
  const startedAt = Date.now()
  const results: AgentRunResult[] = []
  const outputs: Record<string, unknown> = {}
  const pipelineName = opts.name ?? 'pipeline'

  let prevOutput: unknown = pipelineInput
  let ok = true

  console.log(`\n▶ Hermes:${pipelineName} [${runId.slice(0, 8)}] — ${steps.length} step(s)`)

  for (const step of steps) {
    if (step.enabled === false) {
      console.log(`  ⤷ ${step.agent} skipped (disabled)`)
      continue
    }
    const input = step.map ? step.map(outputs, pipelineInput) : prevOutput
    const res = await runAgent(step.agent, input, {
      runId, lane: opts.lane, dryRun: opts.dryRun, parent: pipelineName,
    })
    results.push(res)

    if (res.ok) {
      outputs[step.agent] = res.output
      prevOutput = res.output
      console.log(`  ✓ ${step.agent} (${res.latencyMs}ms)`)
    } else {
      console.log(`  ✗ ${step.agent} — ${String(res.error).slice(0, 120)}`)
      if (step.required !== false) {
        ok = false
        break // required step failed → abort pipeline
      }
    }
  }

  const latencyMs = Date.now() - startedAt
  console.log(`◀ Hermes:${pipelineName} ${ok ? 'OK' : 'FAILED'} (${latencyMs}ms)\n`)
  return { runId, ok, steps: results, finalOutput: prevOutput, outputs, latencyMs }
}

export { runAgent } from './runner'
export { registerAgent, registerAll, getAgent, listAgents, describeAgents } from './registry'
export { submitForReview } from './review-gateway'
export type { Agent, AgentContext, AgentRunResult, PipelineStep, PipelineResult } from './types'
