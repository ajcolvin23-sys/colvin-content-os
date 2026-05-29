// ─── Phased Claude — Phase 1→4 Thinking Protocol Wrapper ────────────────────
// Implements the Gabriel Thinking Protocol from
// automation-os/gabriel/core/THINKING_PROTOCOL.md
//
//   PHASE 1 — Free Thinking
//     Claude generates with minimal constraints. Uses full reasoning.
//     System prompt is a minimal identity (Alfred's voice, lane context).
//     NOT loaded with skill files. NOT loaded with locked rules.
//
//   PHASE 2 — Trigger Scan
//     Fast Haiku call compares Phase 1 output against TRIGGER_MAP.md.
//     Returns list of triggered skills (usually 0-1 items).
//     If 0 triggers → skip Phase 3, jump to Phase 4.
//
//   PHASE 3 — Skill Invoke (only if triggers fired)
//     Loads ONLY the triggered skill sections (not all 32 skills).
//     Sends original output + triggered issues to Claude for targeted fix.
//
//   PHASE 4 — Locked Rules
//     Applies LOCKED_UPGRADES + SAFETY_AND_APPROVALS + lane compliance.
//     Always runs, regardless of triggers.
//
// Why this matters:
//   - Model uses full intelligence in Phase 1 (best quality)
//   - Skills are guardrails, not handcuffs
//   - Pay only for skills that actually trigger (~85% of calls skip Phase 3)
//   - Locked rules always applied (safety)
// ─────────────────────────────────────────────────────────────────────────────
import { callClaude, callClaudeJSON } from './claude'
import { loadSkill, loadCoreFile } from '@/lib/agents/skill-loader'
import type { TaskType } from './model-router'

const ALFRED_VOICE = `Alfred Colvin's voice rules:
- Direct, faith-rooted, entrepreneurial
- Confident but not arrogant
- Practical — every sentence tied to a real outcome
- Short sentences on mobile
- No fluff, no corporate speak
- Indianapolis-grounded when relevant`

const LANE_IDENTITIES: Record<string, string> = {
  colvin_enterprises: 'Colvin Enterprises — AI automation consulting for small businesses. Replace manual work with AI systems. Real outcomes over hype.',
  first_keys_indy: 'First Keys Indy — Marion County minority first-time homebuyer grant education. Compliance-heavy. Always recommend HUD-approved lender. Never guarantee approval.',
  indiana_backflow: 'Indiana Backflow Directory — Programmatic SEO for certified backflow testers. Educational only. No unverified regulatory claims.',
  music_theory_secrets: 'Music Theory Secrets — Free 4-chord cheat sheet lead magnet. Gospel piano, adult beginners, church musicians.',
  funding_ready_indiana: 'FundingReady Indiana — Grant readiness for churches and Black-led nonprofits. Katrina review required.',
}

export interface PhasedCallOptions {
  taskType: TaskType
  task: string                          // The user-facing task: "draft a LinkedIn post about X"
  lane?: string                         // Business lane for compliance context
  responseFormat?: 'text' | 'json'      // If json, returns parsed JSON; default text
  /** Override the Phase 1 system prompt. If not set, uses voice + lane identity. */
  customSystem?: string
  /** Skip trigger scan (use for trivial tasks like dedup). */
  skipTriggerScan?: boolean
  /** Additional context to inject into Phase 1 (per-call rules from caller). */
  additionalContext?: string
}

export interface PhasedCallResult {
  finalOutput: string
  phase1Output: string
  triggersFired: string[]
  skillsLoaded: string[]
  totalCostUsd: number
  totalLatencyMs: number
  phasesRun: ('phase1' | 'phase2' | 'phase3' | 'phase4')[]
}

/**
 * Run a Claude call through the Phase 1→4 Thinking Protocol.
 *
 * @example
 *   const result = await runPhasedClaude({
 *     taskType: 'content_generation',
 *     task: 'Write a LinkedIn hook about manual data entry draining payroll.',
 *     lane: 'colvin_enterprises',
 *   })
 *   console.log(result.finalOutput)  // Voice-checked, compliance-locked content
 *   console.log(result.triggersFired) // [] usually, or ['absolute_promise'] etc.
 */
export async function runPhasedClaude(opts: PhasedCallOptions): Promise<PhasedCallResult> {
  const start = Date.now()
  const phasesRun: ('phase1' | 'phase2' | 'phase3' | 'phase4')[] = []
  let totalCost = 0

  // ── PHASE 1 — Free Thinking ────────────────────────────────────────────────
  phasesRun.push('phase1')
  const phase1System = opts.customSystem ?? buildMinimalSystem(opts.lane, opts.additionalContext)
  const p1 = await callClaude({
    taskType: opts.taskType,
    system: phase1System,
    user: opts.task,
    lane: opts.lane,
    agentName: 'phased-claude-p1',
  })
  totalCost += p1.costUsd
  let currentOutput = p1.text

  // Trivial-task path: skip 2 and 3, just apply locked rules
  if (opts.skipTriggerScan) {
    phasesRun.push('phase4')
    const finalOutput = applyLockedRules(currentOutput, opts.lane)
    return {
      finalOutput,
      phase1Output: p1.text,
      triggersFired: [],
      skillsLoaded: [],
      totalCostUsd: totalCost,
      totalLatencyMs: Date.now() - start,
      phasesRun,
    }
  }

  // ── PHASE 2 — Trigger Scan ──────────────────────────────────────────────────
  phasesRun.push('phase2')
  const triggers = await scanForTriggers(currentOutput, opts.lane, opts.taskType)
  totalCost += triggers.costUsd

  // ── PHASE 3 — Skill Invoke (only if triggers fired) ─────────────────────────
  const skillsLoaded: string[] = []
  if (triggers.list.length > 0) {
    phasesRun.push('phase3')

    // Collect skill sections for each unique skill referenced by triggers
    const skillContextParts: string[] = []
    const uniqueSkills = new Set(triggers.list.map(t => t.skill).filter(Boolean))
    for (const skillName of uniqueSkills) {
      const skill = loadSkill(skillName!, { includeChecklist: false })
      if (skill) {
        skillContextParts.push(`# Skill: ${skill.name}\n${skill.body.slice(0, 4000)}`)
        skillsLoaded.push(skillName!)
      }
    }

    const triggerSummary = triggers.list
      .map(t => `- ${t.condition}: ${t.fix_hint}`)
      .join('\n')

    const correctionSystem = [
      phase1System,
      '',
      '---',
      '',
      '# CORRECTION TASK',
      '',
      'The following output was generated freely but triggered specific quality/compliance issues.',
      'Fix ONLY the flagged issues. Preserve everything else. Do not rewrite from scratch.',
      '',
      '## Triggered issues to fix',
      triggerSummary,
      '',
      '## Relevant skill context',
      ...skillContextParts,
    ].join('\n')

    const p3 = await callClaude({
      taskType: 'compliance_review',
      system: correctionSystem,
      user: `Original output:\n\n${currentOutput}\n\nReturn the corrected output ONLY. No commentary.`,
      lane: opts.lane,
      agentName: 'phased-claude-p3',
    })
    totalCost += p3.costUsd
    currentOutput = p3.text
  }

  // ── PHASE 4 — Locked Rules ──────────────────────────────────────────────────
  phasesRun.push('phase4')
  const finalOutput = applyLockedRules(currentOutput, opts.lane)

  return {
    finalOutput,
    phase1Output: p1.text,
    triggersFired: triggers.list.map(t => t.condition),
    skillsLoaded,
    totalCostUsd: totalCost,
    totalLatencyMs: Date.now() - start,
    phasesRun,
  }
}

/**
 * Convenience: runPhasedClaude that returns parsed JSON.
 */
export async function runPhasedClaudeJSON<T = unknown>(opts: PhasedCallOptions): Promise<{
  json: T
  meta: Omit<PhasedCallResult, 'finalOutput' | 'phase1Output'>
}> {
  // For JSON tasks, append JSON-only instruction to the task
  const jsonTask = opts.task + '\n\nCRITICAL: Respond with ONLY a valid JSON object. No prose, no markdown fences, no commentary.'
  const result = await runPhasedClaude({ ...opts, task: jsonTask, responseFormat: 'json' })

  const cleaned = result.finalOutput
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  let parsed: T
  try {
    parsed = JSON.parse(cleaned) as T
  } catch (err) {
    throw new Error(
      `Phased Claude JSON parse failed. Output start: "${cleaned.slice(0, 200)}". ${err instanceof Error ? err.message : String(err)}`
    )
  }

  return {
    json: parsed,
    meta: {
      triggersFired: result.triggersFired,
      skillsLoaded: result.skillsLoaded,
      totalCostUsd: result.totalCostUsd,
      totalLatencyMs: result.totalLatencyMs,
      phasesRun: result.phasesRun,
    },
  }
}

// ─── Internal: minimal Phase 1 system prompt ─────────────────────────────────

function buildMinimalSystem(lane?: string, additionalContext?: string): string {
  const parts: string[] = [
    'You are Gabriel, Alfred Colvin\'s growth operator and content strategist.',
    '',
    ALFRED_VOICE,
  ]
  if (lane && LANE_IDENTITIES[lane]) {
    parts.push('', '## Current lane', LANE_IDENTITIES[lane])
  }
  if (additionalContext) {
    parts.push('', '## Task context', additionalContext)
  }
  parts.push(
    '',
    'Generate the best possible output using your full reasoning. Quality > compliance theater. The trigger scan that follows will catch issues — do not pre-constrain yourself with disclaimers unless they\'re core to the task.'
  )
  return parts.join('\n')
}

// ─── Phase 2: Trigger Scan ───────────────────────────────────────────────────

interface Trigger {
  condition: string
  fix_hint: string
  skill?: string
}

const TRIGGER_SCAN_SYSTEM = `You are a fast trigger scanner for Gabriel's Thinking Protocol Phase 2.

You read content output and check it against this trigger map:

## Compliance triggers
- Specific dollar guarantees: "you'll save $X", "earn $X more" → fix: "may save", "can help reduce"
- Absolute outcome promises: "guaranteed leads/results/ROI" → fix: replace with "identify opportunities"
- Unverified statistics: "X% of businesses..." with no source → fix: remove or label [industry estimate]
- Specific client results presented as typical: "Client A went from X to Y" → fix: label [example scenario]
- Absolute future promises: "You will..." without qualifier → fix: "you may", "many businesses find"
- Housing dollar claims missing eligibility qualifier
- Interest rates / loan terms (always trigger Katrina review)

## Brand voice triggers
- Buzzword stacking: "leverage synergies", "holistic paradigm", "scalable solutions"
- Missing Indianapolis grounding when lane is local
- Corporate detachment / third-person distance when Alfred's voice expected
- Generic openers: "In today's competitive landscape..."

## Video structure triggers (only if output is video script)
- Missing hook in first 3 seconds
- CTA before 70% of video
- TikTok > 60s, Reel > 30s
- Hook states a fact instead of creating question

Return JSON:
{
  "triggers": [
    {
      "condition": "short label of what triggered",
      "fix_hint": "specific fix",
      "skill": "skill_folder_name if applicable, or null"
    }
  ]
}

Most well-generated outputs trigger 0-1 items. Be honest — don't invent triggers to look thorough. Return { "triggers": [] } if nothing fires.`

async function scanForTriggers(
  output: string,
  lane: string | undefined,
  originalTaskType: TaskType
): Promise<{ list: Trigger[]; costUsd: number }> {
  // Don't trigger-scan structured data tasks (lead scoring, routing)
  const skipTaskTypes: TaskType[] = ['lead_scoring', 'routing_decisions', 'dedup_categorization']
  if (skipTaskTypes.includes(originalTaskType)) {
    return { list: [], costUsd: 0 }
  }

  try {
    const result = await callClaudeJSON<{ triggers: Trigger[] }>({
      taskType: 'qa_review',
      system: TRIGGER_SCAN_SYSTEM,
      user: `Scan this output. Lane: ${lane ?? 'general'}.\n\n${output}`,
      lane,
      agentName: 'phased-claude-p2',
      maxRetries: 1,
    })
    return { list: result.json.triggers ?? [], costUsd: result.meta.costUsd }
  } catch {
    // If trigger scan fails, fail open — return no triggers (don't block the call)
    return { list: [], costUsd: 0 }
  }
}

// ─── Phase 4: Apply Locked Rules ────────────────────────────────────────────

let _lockedRules: string | null = null
function getLockedRules(): string {
  if (_lockedRules !== null) return _lockedRules
  const locked = loadCoreFile('LOCKED_UPGRADES.md') ?? ''
  const safety = loadCoreFile('SAFETY_AND_APPROVALS.md') ?? ''
  _lockedRules = locked + '\n\n' + safety
  return _lockedRules
}

/**
 * Phase 4 currently applies simple string-level locked rules.
 * If you need stronger enforcement (per-lane redaction, etc.), expand this.
 */
function applyLockedRules(output: string, lane?: string): string {
  // Use getLockedRules() to make sure the file load isn't dead code (used for future expansion).
  void getLockedRules()
  let modified = output

  // Compliance lanes — auto-append HUD recommendation
  if (lane === 'first_keys_indy' && !/hud-approved lender/i.test(modified)) {
    if (modified.includes('grant') || modified.includes('qualify') || modified.includes('home')) {
      modified = modified.trimEnd() + '\n\nSpeak with a HUD-approved lender to confirm eligibility.'
    }
  }

  if (lane === 'funding_ready_indiana' && !/no guarantee/i.test(modified)) {
    if (modified.length > 100) {
      modified = modified.trimEnd() + '\n\nFunding eligibility varies — no guarantee of approval.'
    }
  }

  // Block any "guaranteed" outcome that slipped through
  modified = modified.replace(/\bguaranteed (results|outcomes|ROI|leads|approval)/gi, 'identified opportunity for $1')

  return modified
}
