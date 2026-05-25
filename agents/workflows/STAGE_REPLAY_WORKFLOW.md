# Stage Replay Workflow — Colvin Content OS

How to replay a specific failed stage without re-running the entire workflow.

---

## Trigger

Triggered by: INCIDENT_RECOVERY_WORKFLOW (Stage 6A)
Also: Alfred manually requesting replay via dashboard

---

## Prerequisite Checks

Before replay begins, verify:
1. Failed stage has `error_metadata.is_retryable: true` (or Alfred override)
2. Last successful stage's `output_snapshot` is available in workflow_runs
3. Source data has not changed significantly since original run (check timestamps)
4. No idempotency violations exist for the replay
5. The provider/service that caused the failure is now healthy

If any check fails: alert Alfred, do not auto-replay.

---

## Replay Workflow Stages

```
Stage 1: Identify Replay Point
  Agent: Hermes
  Action: Query workflow_runs WHERE run_id = {failed_run_id} ORDER BY created_at
  Action: Find last stage with status = 'completed'
  Action: Identify the next stage (the one that failed or was skipped)
  Output: replay_from_stage = last_completed_stage + 1

Stage 2: Load Last Successful State
  Agent: Hermes
  Action: Retrieve output_snapshot from last completed stage record
  Action: Verify snapshot is complete and usable
  Output: Stage input data for replay

Stage 3: Data Freshness Check
  Agent: Hermes
  Action: Is the input data still current?
    - Leads: are they still valid? (status not changed?)
    - Research data: is it still recent (< 12 hours for time-sensitive)?
    - Config: has gabriel-config.json changed in a way that invalidates this run?
  Output: Freshness status (OK / STALE)
  If STALE: alert Alfred, recommend full rerun instead

Stage 4: Create Replay Run Record
  Agent: Hermes
  Action: Create new workflow_run record with:
    - source: 'replay'
    - provenance.replay_of_stage: original trace_id
    - provenance.parent_run_id: original run_id
    - same idempotency key as the original failed stage (UPDATE, not INSERT)
  Output: New workflow_run record for replay tracking

Stage 5: Execute Replay Stage
  Agent: [The agent responsible for the failed stage]
  Input: Loaded state from Stage 2
  Action: Execute the failed stage with loaded inputs
  Action: Log all step-level activity to new trace_id
  Output: Stage output or failure

Stage 6: Validate Replay Output
  Agent: Schema validator (if applicable)
  Action: Validate output against schema
  Output: PASS → continue, FAIL → create new incident, stop replay

Stage 7: Continue Pipeline
  Agent: Hermes
  Action: On successful replay: continue remaining pipeline stages normally
  Action: All subsequent stages use standard idempotency checks
  Action: Update original workflow_runs record: status = 'replaying' → 'completed'
  Output: Pipeline continues to completion

Stage 8: Replay Completion Log
  Agent: Hermes
  Action: Write summary to workflow_runs:
    - replay_completed: true
    - stages_replayed: [stage_name]
    - replay_duration_ms: [value]
  Action: If this was part of incident recovery: update incident.status = 'resolved'
```

---

## Replay Idempotency

The replay uses the SAME idempotency key as the original failed stage:
- For database inserts: existing idempotency key means records created pre-failure are not duplicated
- For API calls: replay starts fresh — the idempotency is in the DB insert, not the API call

The replay does NOT start from scratch — it uses the last successful snapshot as input. This ensures:
1. No duplicate data from pre-failure successful sub-steps
2. No duplicate API calls for already-completed work
3. Full audit trail linking replay to original run

---

## Integration Status

PLANNED — Phase 5. Depends on: workflow_runs table with output_snapshot fields.
