# Stage Replay Policy — Colvin Content OS

Stage replay allows re-running a failed stage without re-running the entire workflow. This preserves work done before the failure and respects idempotency.

---

## When Replay Is Appropriate

Replay is appropriate when:
- A transient error caused the failure (rate limit, timeout, brief outage)
- The stage's input data is still valid (not stale)
- The failed stage did not partially write data (or the partial write is safely reversible)
- The recovery window is < 12 hours (older missed runs may have stale data)
- Alfred has approved the replay (for P2+ incidents)

Replay is NOT appropriate when:
- The failure was a policy violation (must fix policy first)
- The failure was a schema validation failure and regeneration also failed
- The stage's source data has changed significantly since the original run
- The run is > 24 hours old (data likely stale)
- The circuit breaker is still open for a required provider

---

## Stage Idempotency Requirements

For a stage to be replayable, it must be idempotent:
- Must generate the same (or equivalent) output given the same input
- Must not create duplicate side effects (duplicate DB inserts, duplicate messages)
- Must check existing records via idempotency key before inserting

**Idempotent stages:**
- Lead extraction (idempotency key prevents duplicates)
- Lead enrichment (update existing record if key matches)
- Content generation (new idempotency key per draft per date)
- Score calculation (pure function — no side effects)
- Deduplication (read-only query)
- Schema validation (read-only)

**Non-replayable without precautions:**
- Any stage that has already sent a message to a real person
- Any stage that has already triggered a render (check render status first)
- Any stage that modified an approved record

---

## Replay Procedure

1. **Identify replay point:**
   - Query workflow_runs for the run_id: find last stage with `status: completed`
   - The replay starts at the NEXT stage after the last completed one

2. **Load last successful state:**
   - Retrieve `output_snapshot` from the last completed stage record
   - This becomes the input to the replay stage

3. **Verify data freshness:**
   - Check if source data (leads, briefs, config) has changed since original run
   - If significantly changed: full rerun instead of replay

4. **Set replay metadata:**
   - Create new workflow_runs record with `source: 'replay'`
   - Set `provenance.replay_of_stage = original_stage_trace_id`
   - Set `provenance.parent_run_id = original_run_id`
   - Use same idempotency key as original stage (update, don't insert new)

5. **Execute replay stage:**
   - Run stage with loaded state as input
   - Validate output against schema
   - If success: advance to next stage
   - If fails again: do not replay again — create incident, alert Alfred

6. **Continue pipeline:**
   - After successful replay: continue remaining stages normally
   - All subsequent stages use standard idempotency checks

---

## What Cannot Be Replayed

| Stage Type | Reason |
|-----------|--------|
| Already-sent outreach | Would send duplicate |
| Already-published content | Would publish duplicate |
| Already-triggered render (rendering/rendered status) | Would create duplicate render |
| Compliance review after violation | Must fix first |
| Data deletion stage | Cannot undo |

---

## Replay Authorization

| Replay Type | Authorization Required |
|------------|----------------------|
| Transient error replay | Auto (Hermes) for P3 issues |
| Circuit breaker recovery replay | Hermes after circuit closes |
| P2 incident replay | Alfred approval |
| P1 incident replay | Alfred approval + explicit confirmation |
| Manual replay (Alfred triggered) | Alfred — always authorized |

---

## Replay Logging

Every replay creates a new workflow_runs record with:
- `source: 'replay'`
- `provenance.replay_of_stage`: original trace_id
- `attempt`: incremented from original
- Full error context preserved in the original record
- New output stored in the replay record

This creates a complete audit trail: original run → failure → replay → result.
