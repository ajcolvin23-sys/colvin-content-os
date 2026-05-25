// ─── Agent System Types ────────────────────────────────────────────────────────

export type AgentName = 'gabriel' | 'solomon' | 'genius'

export type BusinessLane =
  | 'first_keys_indy'
  | 'piano'
  | 'backflow'
  | 'colvin_enterprises'
  | 'youtube'
  | 'funding_ready_indiana'
  | 'girls_got_game'
  | 'yahweh_comics'
  | 'glory_engine'

// A single step in the orchestrator's execution plan
export interface PlanStep {
  agent: AgentName
  task: string                    // legacy — kept for backwards compat
  task_brief?: string             // v2 — 2-3 sentence brief; orchestrator builds full genius prompt from this
  needs_prior_output?: boolean    // true = inject handoff summary from previous step
  run_parallel?: boolean          // true = run at same time as adjacent parallel steps
  handoff_summary_needed?: boolean // true = build a targeted handoff for the next agent
}

// The plan returned by the planning phase
export interface OrchestratorPlan {
  intent: string                  // what Alfred actually wants
  lane: BusinessLane | null       // which business lane this is for
  steps: PlanStep[]               // ordered execution steps
  reasoning: string               // why this plan was chosen
}

// Result from a single agent run
export interface AgentResult {
  agent: AgentName
  task: string
  output: string
  success: boolean
  error?: string
}

// The full orchestrator response
export interface OrchestratorResponse {
  request: string
  plan: OrchestratorPlan
  results: AgentResult[]
  final_output: string            // assembled, ready-to-use answer
  agents_used: AgentName[]
  execution_time_ms: number
}
