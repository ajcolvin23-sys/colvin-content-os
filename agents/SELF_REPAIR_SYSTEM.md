# Self-Repair System — Colvin Content OS

All 10 reliability patterns used by Hermes to detect and recover from failures autonomously. Alfred is only paged for P1/P2 incidents that require human decision-making.

---

## Design Principles

1. **Repair silently when safe.** Transient failures (timeouts, 429s) are handled automatically without paging Alfred.
2. **Alert for human decisions.** Anything that changes scope, skips a lead, or requires judgment goes to Alfred.
3. **Never corrupt data.** Idempotency keys and schema validation prevent duplicate records and bad data from entering Supabase.
4. **Log everything.** Every repair action is a `workflow_run` record in Supabase with `status: 'replaying'`.
5. **Know when to stop.** Unrecoverable failures escalate to incident creation rather than infinite retry loops.

---

## Pattern 1 — Retry with Backoff

**Trigger:** HTTP 429 (rate limited), HTTP 503 (service unavailable), network timeout

**Implementation:**
```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  options: { maxAttempts: number; baseDelayMs: number; provider: string }
): Promise<T> {
  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === options.maxAttempts) throw error;
      const delay = options.baseDelayMs * Math.pow(2, attempt - 1);
      const jitter = Math.random() * 1000;
      await sleep(delay + jitter);
      logRetry(options.provider, attempt, delay + jitter);
    }
  }
  throw new Error('Max attempts reached');
}
```

**Config per provider:**

| Provider | Max Attempts | Base Delay |
|----------|-------------|------------|
| OpenAI | 3 | 2000ms |
| Firecrawl | 3 | 1000ms |
| Supabase | 3 | 500ms |
| Telegram | 2 | 1000ms |
| Remotion MCP | 2 | 5000ms |

**After max attempts:** Open circuit breaker for that provider. Log to `workflow_runs`. Alert Hermes Supervisor.

---

## Pattern 2 — Circuit Breaker

**Trigger:** 5 consecutive failures for a single provider

**States:**
- `CLOSED` (healthy) — requests flow normally
- `OPEN` (failing) — requests blocked immediately, error returned
- `HALF-OPEN` (testing) — 1 probe request allowed every 60 seconds

**Implementation approach:**
```typescript
class CircuitBreaker {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  failureCount = 0;
  lastFailureTime: number | null = null;
  
  async call<T>(fn: () => Promise<T>, provider: string): Promise<T> {
    if (this.state === 'OPEN') {
      const timeSinceFailure = Date.now() - (this.lastFailureTime ?? 0);
      if (timeSinceFailure < 60_000) {
        throw new CircuitOpenError(`Circuit open for ${provider}`);
      }
      this.state = 'HALF_OPEN';
    }
    // ... execute, record success/failure, transition states
  }
}
```

**When circuit opens:**
- Log P2 incident to Supabase `incidents` table
- Send Telegram alert: "Circuit breaker OPEN: [provider]. Workflow [name] blocked."
- Hermes Supervisor polls every 60 seconds for recovery

---

## Pattern 3 — Idempotency

**Trigger:** Before every write to Supabase (leads, outreach drafts, content, workflow_runs)

**Key format:** `{lane}_{action}_{target_identifier}_{date}`

Examples:
- Lead: `indiana_backflow_lead_john_smith_plumbing_2026-01-15`
- Outreach: `colvin_enterprises_email_jane_doe_acme_corp_2026-01-15`
- Render: `music_theory_secrets_render_hook_reveal_30_2026-01-15`

**Implementation:**
```typescript
async function upsertWithIdempotency<T>(
  table: string,
  idempotencyKey: string,
  record: T
): Promise<{ created: boolean; record: T }> {
  const existing = await supabase
    .from(table)
    .select('*')
    .eq('idempotency_key', idempotencyKey)
    .single();
  
  if (existing.data) {
    return { created: false, record: existing.data as T };
  }
  
  const { data } = await supabase.from(table).insert(record).select().single();
  return { created: true, record: data as T };
}
```

**Contact window enforcement:** 30-day minimum between outreach attempts per lead. Enforced in `LEAD_DEDUPLICATION_RULES.md`.

---

## Pattern 4 — Schema Validation

**Trigger:** Before every record insert to Supabase

**Implementation (AJV):**
```typescript
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ strict: false });
addFormats(ajv);

export function validate(schemaName: string, data: unknown): void {
  const schema = loadSchema(schemaName);
  const valid = ajv.validate(schema, data);
  if (!valid) {
    throw new SchemaValidationError(
      `Schema validation failed for ${schemaName}: ` +
      JSON.stringify(ajv.errors)
    );
  }
}
```

**On validation failure:**
- Do NOT insert the record
- Log `workflow_run` with `status: 'failed'`, `error_metadata.code: 'SCHEMA_VALIDATION_FAILURE'`
- Quarantine the invalid record to a `quarantine_log` table for debugging
- Continue processing other records in the batch (do not abort the whole run)

---

## Pattern 5 — Stage Replay

**Trigger:** Recoverable failure in a pipeline stage (network error, timeout, transient API error)

**When replay is safe:**
- Stage is idempotency-key protected
- Output does not depend on time-sensitive external data older than 4 hours
- Stage has not already succeeded in this run

**When replay is NOT safe:**
- Stage involves sending outreach (requires Alfred re-approval)
- Stage involves rendering video (re-render creates duplicate)
- Stage contains personally-generated content that may differ on retry

**Replay procedure:**
1. Log replay attempt to `workflow_runs` with `status: 'replaying'`
2. Re-run stage function with same input_snapshot
3. If success: log `status: 'completed'`, advance pipeline
4. If failure again after 2 replay attempts: escalate to P2 incident

See `STAGE_REPLAY_POLICY.md` and `workflows/STAGE_REPLAY_WORKFLOW.md`.

---

## Pattern 6 — Dead Letter Queue (DLQ)

**Trigger:** Stage fails after max replay attempts

**Implementation:**
- Failed stage output stored in `workflow_runs` with `status: 'failed'`
- `input_snapshot` preserved so Alfred or Hermes can manually replay later
- DLQ items visible in observability dashboard
- Daily DLQ review by Error Log Review Agent

**DLQ resolution options:**
- Manual replay by Alfred (for non-idempotent stages)
- Skip gracefully (log + move on)
- P1 escalation (if the failure blocks a critical path)

---

## Pattern 7 — Bulkhead Isolation

**Trigger:** Always — prevents one failing lane from blocking others

**Implementation:** Each lane's pipeline runs independently. Failure in `indiana_backflow` does not stop `music_theory_secrets` from running.

```typescript
const results = await Promise.allSettled(
  activeLanes.map(lane => runLanePipeline(lane, runId))
);

results.forEach((result, index) => {
  if (result.status === 'rejected') {
    logLaneFailure(activeLanes[index], result.reason);
  }
});
```

**Alert rule:** If 2+ lanes fail in same run, create P2 incident.

---

## Pattern 8 — Durable State

**Trigger:** Every stage start and completion

**Implementation:**
- Every stage logs a `workflow_run` record to Supabase at start (status: `running`)
- On success: update to `completed` with `output_snapshot`
- On failure: update to `failed` with `error_metadata`
- Run restart checks `workflow_runs` to skip already-completed stages

**Purpose:** If the server restarts mid-run, Hermes can resume from the last incomplete stage rather than starting over.

---

## Pattern 9 — Human Gate Escalation

**Trigger:** Situation exceeds Hermes's autonomous repair authority

**Escalation conditions:**
- Policy violation detected in content
- Lead flagged as potential `do_not_contact`
- Compliance check fails on outreach (cannot auto-fix)
- P1 incident (production-critical failure)
- Any action that would modify data for a sent/published/rendered item

**Process:**
1. Hermes blocks the pipeline at current stage
2. Creates review_ticket (type: `system_change` or incident type)
3. Sends Telegram alert to Alfred with situation summary and options
4. Waits for Alfred's decision (timeout per escalation type — see HUMAN_APPROVAL_QUEUE.md)
5. Executes Alfred's chosen path

---

## Pattern 10 — Incident Creation

**Trigger:** Any failure that meets P1 or P2 criteria (see INCIDENT_RESPONSE_POLICY.md)

**P1 examples:** Production down, compliance violation in published content, data integrity failure, API keys compromised

**P2 examples:** Circuit breaker open, review queue overflow, missed daily cron, 2+ consecutive dedup failures

**Auto-creation process:**
```typescript
async function createIncident(params: {
  severity: 'P1' | 'P2' | 'P3';
  failed_stage: string;
  cause: string;
  recommended_fix: string;
  run_id: string;
}): Promise<string> {
  const incident = {
    incident_id: uuidv4(),
    ...params,
    status: 'open',
    created_at: new Date().toISOString(),
    idempotency_key: `system_incident_${params.failed_stage}_${new Date().toISOString().split('T')[0]}`
  };
  await validate('incident.schema.json', incident);
  await supabase.from('incidents').insert(incident);
  await notifyAlfred(incident);
  return incident.incident_id;
}
```

---

## Self-Repair Decision Tree

```
Error occurs
  ↓
Is it a schema validation error?
  → YES: Quarantine record, skip, log, continue batch
  → NO: Continue ↓

Is it a policy violation?
  → YES: Block stage, create review ticket, alert Alfred
  → NO: Continue ↓

Is it a transient error (429, 503, timeout)?
  → YES: Retry with backoff (up to 3 attempts)
         → Success: continue
         → Still failing after 3 attempts: open circuit breaker
  → NO: Continue ↓

Is it a known recoverable error?
  → YES: Stage replay (if idempotency-safe)
         → Success: continue
         → Failure after 2 replays: DLQ + P2 incident
  → NO: Continue ↓

Is it an unrecoverable error?
  → YES: P1 incident, halt workflow, alert Alfred immediately
```

---

## Integration Status

PLANNED — Phase 5. Patterns 3 (Idempotency) and 4 (Schema Validation) should be implemented in Phase 1 as foundation patterns.
