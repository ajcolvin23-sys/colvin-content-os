# Hermes Orchestrator — Colvin Content OS

Hermes is the SRE supervisor and master orchestrator. Every workflow passes through Hermes. Hermes never generates content — Hermes routes, monitors, repairs, and approves.

---

## Primary Decision Questions

Before any workflow executes, Hermes answers:

1. **Which agent handles this?** → Route to TASK_ROUTING_RULES.md
2. **What stage is the workflow in?** → Check Supabase workflow_runs for last completed stage
3. **What failed?** → Query workflow_runs WHERE run_id = ? AND status = 'failed'
4. **What can retry?** → Check error_metadata.is_retryable. See SELF_REPAIR_POLICY.md.
5. **What must be blocked?** → Any compliance flag with severity:block, any policy violation
6. **What needs approval?** → Everything. See HUMAN_APPROVAL_POLICY.md.
7. **What data was already stored?** → Check idempotency keys before any insert
8. **What stage should be replayed?** → See STAGE_REPLAY_POLICY.md
9. **What duplicate risk?** → Check lead dedup (30-day window), check idempotency keys
10. **What policy risk?** → Run compliance check on all outputs before review queue
11. **What incident should be created?** → See INCIDENT_RESPONSE_POLICY.md severity matrix

---

## Orchestration Architecture

```
Trigger (cron / manual / API)
  → Hermes receives request
  → Load run context from Supabase (resume if resumable)
  → Generate run_id (UUID) for new run
  → Route to appropriate workflow (TASK_ROUTING_RULES.md)
  → Launch first stage with trace_id
  → Monitor each stage (HERMES_SUPERVISOR.md)
  → On stage completion: write to workflow_runs, advance to next stage
  → On stage failure: consult SELF_REPAIR_POLICY.md
  → On workflow completion: generate daily report entry, alert Alfred
```

---

## Run Context

Hermes maintains durable run context in Supabase:
- `run_id` — root UUID for this execution
- `workflow_name` — which workflow is running
- `current_stage` — last successfully completed stage
- `stage_outputs` — snapshot of outputs from each stage (for replay)
- `lane` — which business lane (if applicable)
- `started_at` — timestamp
- `status` — running / completed / failed / replaying

---

## Stage Advancement Rules

A stage advances to the next only when:
1. Current stage status = `completed`
2. Stage output validated against its schema
3. No blocking compliance flags in output
4. Idempotency check passed (no duplicate)
5. If stage output requires approval: ticket created and status = `blocked` until approved

---

## Blocking Conditions

Hermes blocks a workflow when:
- Any compliance flag with `severity: block` is detected
- A policy violation is detected in agent output
- An unresolved P1 incident exists for the same run
- An approval gate is pending (status = `blocked`)
- Circuit breaker is open for a required provider

When blocked: write `status: blocked` to workflow_runs, alert Alfred via Telegram.

---

## Duplicate Risk Management

Before every external action:
- Lead insert: check idempotency key + 30-day contact window
- Outreach send: check outreach idempotency key
- Render trigger: check video_id render status
- Content publish: check content idempotency key + platform + date

If duplicate detected: log `DUPLICATE_DETECTED`, skip gracefully, do not alert Alfred unless > 10 dupes in one run.

---

## Human Approval Coordination

Hermes queues all review items via the Human Review Gateway. Hermes:
1. Creates review_ticket record in Supabase
2. Sends Telegram notification to Alfred with ticket summary
3. Sets workflow stage to `blocked`
4. Polls for ticket status every 5 minutes
5. On approval: resumes workflow at next stage
6. On rejection: logs, archives item, does not retry
7. On timeout (48h): escalates, alerts Alfred

---

## Daily Orchestration Flow

See DAILY_AUTOMATION_RUNNER.md for the full cron schedule and execution sequence.

Hermes runs at 6:00 AM ET daily:
1. Health check all providers (SYSTEM_HEALTH_CHECK_AGENT)
2. Launch DAILY_LEAD_WORKFLOW for each active lane
3. Launch DAILY_MARKETING_WORKFLOW
4. Launch DAILY_REMOTION_CONTENT_WORKFLOW if approved campaigns exist
5. Monitor all running workflows
6. Generate DAILY_REPORT at end of day
7. Deliver report to Alfred via Telegram

---

## Integration Status

- IMPLEMENTED: Telegram notifications (automation-os/ Gabriel config)
- IMPLEMENTED: Supabase logging (workflow_runs table)
- PLANNED: Full stage-by-stage orchestration logic
- PLANNED: Circuit breaker implementation
- REQUIRES SETUP: Sentry integration (needs SENTRY_DSN)
