# Incident Response Policy — Colvin Content OS

---

## Incident Severity Levels

| Severity | Definition | SLA (Alert) | SLA (Resolve) |
|----------|-----------|------------|--------------|
| P1 | System down, data at risk, security breach, compliance violation live | 2 minutes | 1 hour |
| P2 | Degraded function, missed run, API quota exceeded, render pipeline down | 10 minutes | 4 hours |
| P3 | Minor issue, single non-critical failure, low-impact degradation | Daily report | 48 hours |

---

## P1 Examples

- Supabase connection failure (cannot read/write)
- OpenAI account suspended (all generation halted)
- API key leaked in any output or log
- Unauthorized action executed (send/publish without approval)
- HUD/RESPA violation in published First Keys Indy content
- Youth safety violation in Girls Got Game content
- Data corruption detected in lead records

## P2 Examples

- Gabriel daily run missed
- OpenAI quota exceeded for current period
- Firecrawl failing consistently
- Review queue overflow (> 50 items)
- Remotion render pipeline down
- Telegram bot not responding
- Missing environment variable halting workflow
- Schema validation failure rate > 20%

## P3 Examples

- Single API timeout (recovered by retry)
- Dedup rate anomaly (> 50% in one run)
- Non-critical workflow missed
- Lead scoring inconsistency in single batch
- Minor content quality degradation

---

## Incident Schema

```json
{
  "id": "uuid",
  "run_id": "uuid",
  "trace_id": "string",
  "severity": "P1|P2|P3",
  "failed_stage": "string",
  "cause": "enum (see incident.schema.json)",
  "error_message": "string",
  "recommended_fix": "string",
  "status": "open|investigating|mitigating|resolved|closed_no_action",
  "created_at": "ISO 8601",
  "resolved_at": "ISO 8601 | null"
}
```

---

## Incident Creation Process

Hermes creates an incident when:
1. A failure matches a P1/P2/P3 trigger condition
2. Retry attempts are exhausted for a given failure
3. A circuit breaker opens on a critical provider
4. A compliance or security check returns a block

**Steps:**
1. Generate incident record in Supabase `incidents` table
2. Set `status: open`
3. Generate `recommended_fix` based on cause
4. Send Telegram alert to Alfred (format per HERMES_SUPERVISOR.md)
5. Set workflow_runs stage to `failed` or `blocked`
6. Begin mitigation if auto-mitigatable (see SELF_REPAIR_POLICY.md)

---

## Incident Investigation

When Alfred responds via Telegram or dashboard:
1. Set `status: investigating`
2. Hermes provides:
   - Last 5 workflow_runs records for the run_id
   - Full error_metadata from the failed stage
   - List of idempotency keys for affected records
   - Recommended fix with specific commands or steps
3. Alfred decides: fix + replay, skip, or full rerun

---

## Incident Resolution

To mark resolved:
1. Root cause identified and documented in `resolution_notes`
2. Fix applied (code, config, or manual action)
3. Verify system healthy (synthetic test or manual check)
4. Set `status: resolved`, `resolved_at: now()`
5. If replay appropriate: initiate stage replay per STAGE_REPLAY_POLICY.md

---

## Post-Incident Review

For every P1 incident after resolution:
1. Document in incident record: what happened, root cause, fix, time to resolve
2. Add to weekly security/optimization review
3. If code change needed: create GitHub issue
4. If policy update needed: update relevant policy document in /agents/

For P2 incidents: include in weekly AUTOMATION_AUDIT_AGENT report.
For P3 incidents: batch-review in weekly optimization workflow.

---

## Incident Telegram Alert Format

```
[P1] 🚨 COLVIN CONTENT OS INCIDENT
Stage: {failed_stage}
Cause: {cause}
Run ID: {run_id_first_8}
Error: {error_message_first_200_chars}

Recommended Fix:
{recommended_fix}

Status: Open | Created: {created_at}
Reply /ack {incident_id} to acknowledge
```
