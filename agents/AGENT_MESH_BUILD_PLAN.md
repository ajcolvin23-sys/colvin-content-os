# Agent Mesh Build Plan — "All Agents Live"

**Goal:** turn the documented Master Agent Map into a real, running agent mesh —
every agent independently dispatched, validated, observable, and supervised by Hermes.

**Decisions (Alfred, 2026-06-03):**
- Architecture: **Full agent mesh** (each agent a real, individually-callable unit under Hermes).
- First capability group to go live: **Full Remotion Video Studio**.

## Two non-negotiable guardrails

1. **Strangler-fig migration.** `gabriel:daily` (the current 16-step runner) keeps
   running unchanged until each mesh agent reaches *parity*. We migrate behind a flag,
   compare outputs, then cut over. No day ever ships with no content.
2. **Prove the pattern on ONE vertical slice first.** Build the spine + the Video Studio
   end-to-end through Hermes before mass-refactoring the other ~30 agents. Lock the
   conventions once.

## Safety rules carried forward (permanent)
- Draft → Alfred approves → publish. Never auto-publish/send/deploy.
- No fabricated stats / client names / invented ROI. Evidence scanner on all copy.
- Katrina compliance gate for first_keys_indy, funding_ready_indiana, girls_got_game.
- LOCKED_UPGRADES.md rules are permanent (incl. 6-scene cinematic structure).
- Models route through `automation-os/config/model-routing.json` (Claude), not hardcoded.

---

## The agent contract (the pattern every agent follows)

Every agent — LLM-backed or deterministic — is a module implementing one interface:

```ts
interface Agent<I, O> {
  name: string                      // unique registry key, e.g. "remotion.script-writer"
  taskType: TaskType                // model routing key (or "deterministic")
  inputSchema: JSONSchema           // AJV-validated
  outputSchema: JSONSchema          // AJV-validated
  run(input: I, ctx: AgentContext): Promise<O>
}
```

- **Runner** (`lib/agents/runner.ts`): `runAgent(name, input, ctx)` → validates input,
  calls `run()`, validates output, logs `{run_id, agent, status, latency_ms, cost_usd,
  input, output, error}` to the `agent_runs` table, retries with backoff, trips a
  circuit breaker after N failures. The ONLY way agents are invoked.
- **Registry** (`lib/agents/registry.ts`): name → agent module. One import surface.
- **Hermes** (`lib/agents/hermes.ts`): executes a **pipeline** (ordered list of agent
  calls with typed data flow), owns the run id, supports per-agent enable/disable, and
  terminates pipelines at the **Human Review Gateway**.
- **Schemas** live in `agents/schemas/*.schema.json` (AJV Draft-07).
- **Observability**: every run is a row in `agent_runs`; a dashboard reads it so "all
  agents live" is something you can *see* (last run, pass/fail, cost).

---

## Phase 0 — Foundation / the spine  *(prereq for everything)*
- [ ] Honest status pass on `MASTER_AGENT_MAP.md` (done in this plan's commit).
- [ ] `lib/agents/types.ts` — `Agent`, `AgentContext`, `PipelineStep`, result types.
- [ ] `lib/agents/runner.ts` — validation + logging + retry + circuit breaker (wraps `callClaudeJSON`).
- [ ] `lib/agents/registry.ts` — registration + lookup.
- [ ] `lib/agents/hermes.ts` — pipeline executor + run-id + enable/disable + review-gateway terminus.
- [ ] `supabase/migrations/` — `agent_runs` table (+ `agents` registry table optional).
- [ ] AJV wired; `agents/schemas/` Draft-07 validation helper.
- [ ] Human Review Gateway as a real module (`lib/agents/review-gateway.ts`) — already
      partially exists in step10/11; promote it.
- **Exit criteria:** a trivial `echo` agent runs through Hermes, validates I/O, logs a row.

## Phase 1 — Vertical slice: **Remotion Video Studio** (first group live)
Build these as real agents under a `remotion.studio` pipeline:
- [ ] `remotion.template` — selects best-fit template (replaces implicit format routing).
- [ ] `remotion.script-writer` — hook + voiceover + on-screen text + CTA (6-scene locked).
- [ ] `remotion.scene-planner` — scenes, durations, components, motion.
- [ ] `remotion.caption-timing` — word-by-word caption timing.
- [ ] `remotion.asset-manifest` — required assets + license verification.
- [ ] `remotion.video-agent` — assembles the full `remotion_video.schema.json` blueprint.
- [ ] `remotion.render-qa` — 25-item QA checklist pre/post render.
- [ ] `remotion.studio` (coordinator) — orchestrates the above, hands blueprint to the
      existing `render-daily` render+audio+assets pipeline, then to Review Gateway.
- [ ] Parity test vs current step5 video_script + render-daily; cut over behind a flag.
- **Exit criteria:** a lane's video is produced end-to-end through Hermes, QA-gated,
  observable, with identical-or-better output to today's pipeline.

## Phase 2 — Promote existing real steps into agents
Split the proven `gabriel:daily` steps into individually-callable agents under Hermes
(behavior identical, structure modular): lead-finder, lead-enrichment, source-verify,
lead-scoring (deterministic), lead-dedup (deterministic), email-copy, social-media,
caption-hashtag, brand-voice, colvin-infographic, solomon-seo, vibe-marketing,
daily-report, memory. Replace the hardcoded runner with a Hermes pipeline definition.

## Phase 3 — Build missing capability groups (as real agents)
- **Funnels:** funnel-builder, landing-page-copy, lead-magnet, form-question,
  nurture-sequence, conversion-audit, offer-positioning, thank-you-page.
- **Outreach:** outbound-sequence + reply-handling + follow-up automation.
- **Content calendar**, standalone **compliance-check** & **schema-validator** gates.

## Phase 4 — Admin / ops agents (scheduled cron)
admin-qa, system-health-check, automation-audit, security-review, error-log-review,
crm-hygiene, backup-restore-qa, daily-report — real cron jobs feeding the dashboard.

## Phase 5 — Hermes Supervisor + Observability
- Supervisor: 5-min health sweep, circuit breakers, incident creation.
- Dashboard page: every agent, last run, status, cost, output link.

---

## Status legend used in the map
REAL = runs in code today · PARTIAL = behavior exists but folded into a script ·
PLANNED = spec only, no code · REQUIRES SETUP = needs env/OAuth/config.
