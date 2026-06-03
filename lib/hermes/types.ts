// ─── Hermes Agent Mesh — Core Contracts ─────────────────────────────────────
// Every agent in the mesh (LLM-backed or deterministic) implements `Agent`.
// Agents are ONLY ever invoked through `runAgent()` (the runner), which validates
// I/O against JSON Schema, logs a run row, retries, and trips a circuit breaker.
// Hermes strings agents into pipelines. See agents/AGENT_MESH_BUILD_PLAN.md.

import type { TaskType } from '@/lib/ai/model-router'

export type AgentKind = 'llm' | 'deterministic'

/** JSON Schema (Draft-07) object. Kept loose on purpose — AJV validates at runtime. */
export type JsonSchema = Record<string, unknown>

export interface AgentContext {
  /** Correlates every agent run within a single pipeline execution. */
  runId: string
  /** Business lane, when relevant (telemetry + model routing hints). */
  lane?: string
  /** When true, side-effecting agents must not write/send anything. */
  dryRun?: boolean
  /** Name of the agent/pipeline that invoked this one (for the call tree). */
  parent?: string
  /** Structured logger — prefixes with agent name + runId. */
  log: (msg: string) => void
}

export interface Agent<I = unknown, O = unknown> {
  /** Unique registry key, e.g. "remotion.script-writer". */
  name: string
  description?: string
  kind: AgentKind
  /** Model-routing key for llm agents. Omit for deterministic agents. */
  taskType?: TaskType
  /** AJV-validated input contract. Omit to skip input validation. */
  inputSchema?: JsonSchema
  /** AJV-validated output contract. Omit to skip output validation. */
  outputSchema?: JsonSchema
  /** Max retry attempts (default 2). */
  maxRetries?: number
  run(input: I, ctx: AgentContext): Promise<O>
}

export interface AgentRunResult<O = unknown> {
  agent: string
  runId: string
  ok: boolean
  output?: O
  error?: string
  attempts: number
  latencyMs: number
  /** Whether the circuit breaker short-circuited this call. */
  circuitOpen?: boolean
}

// ─── Pipelines (Hermes) ─────────────────────────────────────────────────────

export interface PipelineStep<Acc = Record<string, unknown>> {
  /** Registry name of the agent to run. */
  agent: string
  /** Build this agent's input from the accumulated outputs of prior steps.
   *  Defaults to passing the immediately-previous step's output through. */
  map?: (acc: Acc, pipelineInput: unknown) => unknown
  /** Skip this step when false (per-agent enable/disable). Default true. */
  enabled?: boolean
  /** If true, a failure here aborts the pipeline. Default true. */
  required?: boolean
}

export interface PipelineResult {
  runId: string
  ok: boolean
  steps: AgentRunResult[]
  /** Output of the last successful step. */
  finalOutput: unknown
  /** Outputs keyed by agent name. */
  outputs: Record<string, unknown>
  latencyMs: number
}
