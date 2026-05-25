# Incident Recovery Workflow — Colvin Content OS

Detect → classify → identify failed stage → decide recovery → execute → verify → close.

---

## Trigger

Triggered by: Hermes detecting a failure that meets incident threshold.
Also: Alfred manually creating an incident via dashboard or Telegram command.

---

## Workflow Stages

```
Stage 1: Incident Detection
  Agent: Hermes
  Trigger: Error threshold met, circuit breaker opened, missed run detected
  Action: Create incident record in Supabase
  Output: incident.schema.json record (status: 'open')

Stage 2: Classification
  Agent: Hermes
  Action: Assign severity (P1/P2/P3) per INCIDENT_RESPONSE_POLICY.md
  Action: Identify cause from error_metadata
  Output: Severity + cause in incident record

Stage 3: Alert
  Agent: Hermes → Telegram
  Action: Send formatted alert per severity
  P1: Immediate, formatted ALERT message
  P2: Within 10 minutes
  P3: Include in next daily report

Stage 4: Investigation (Hermes prepares context for Alfred)
  Agent: Hermes
  Action: Query last 5 workflow_runs for the failed run_id
  Action: Query error_metadata for failed stage
  Action: Check idempotency keys for affected records
  Action: Generate recommended_fix
  Output: Investigation context stored in incident record

Stage 5: Alfred Decision
  [Alfred receives alert via Telegram or dashboard]
  Options:
    A) Replay from failed stage → Stage 6A
    B) Full rerun from scratch → Stage 6B
    C) Manual fix required → Stage 6C
    D) Skip this run, continue tomorrow → Stage 6D
    E) Escalate (P1 escalation) → Stage 6E

Stage 6A: Replay Recovery
  Agent: Hermes → Stage Replay (see STAGE_REPLAY_WORKFLOW.md)
  Action: Load state from last completed stage
  Action: Re-execute from failed stage
  Action: Verify output
  Action: Continue pipeline

Stage 6B: Full Rerun
  Agent: Hermes
  Action: New run_id generated
  Action: Re-execute full workflow from Stage 1
  Action: Idempotency keys prevent duplicates

Stage 6C: Manual Fix
  Agent: N/A (Alfred fixes externally)
  Action: Alfred resolves the underlying issue (API key, schema, code)
  Action: Marks incident as 'mitigating'
  Action: Re-triggers relevant workflow when ready

Stage 6D: Skip
  Agent: Hermes
  Action: Mark incident as 'closed_no_action'
  Action: Log reason
  Action: Ensure tomorrow's run starts fresh

Stage 6E: P1 Escalation
  Agent: Hermes
  Action: Create additional alert
  Action: Mark all dependent workflows as blocked until resolved

Stage 7: Verification
  Agent: Hermes
  Action: Verify recovery was successful
  Action: Check: Did the pipeline complete? Were outputs valid?
  Action: Run synthetic health check on affected provider/stage

Stage 8: Incident Close
  Agent: Hermes
  Action: Set incident.status = 'resolved'
  Action: Set incident.resolved_at = now()
  Action: Document resolution in incident.resolution_notes
  Action: If P1/P2: add to WEEKLY_OPTIMIZATION_WORKFLOW review queue

Stage 9: Post-Incident Action
  Agent: Admin QA Agent
  Action: Add incident to weekly audit report
  Action: If pattern detected (same failure 3+ times): escalate to SIP
```

---

## Integration Status

PLANNED — Phase 5. HERMES_ORCHESTRATOR.md and INCIDENT_RESPONSE_POLICY.md define the rules. This workflow implements them.
