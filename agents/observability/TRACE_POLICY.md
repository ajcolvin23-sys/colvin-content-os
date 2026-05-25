# Trace Policy — Colvin Content OS

OpenTelemetry-aligned trace structure. Every pipeline stage is traced.

---

## Trace Structure

```
Root Span: run_id (UUID)
  ├── Span: Stage 1 (trace_id_1)
  ├── Span: Stage 2 (trace_id_2)
  ├── Span: Stage 3 (trace_id_3)
  │   ├── Sub-span: API call to Firecrawl
  │   └── Sub-span: Schema validation
  └── Span: Stage N (trace_id_N)
```

---

## run_id

- Generated once per workflow execution
- UUID v4 format
- Stored as root identifier in every workflow_runs record for this execution
- Used to reconstruct the full execution history
- Passed to all agents as part of the execution context

```typescript
const runId = crypto.randomUUID(); // Generate at workflow start
```

---

## trace_id

- Generated once per stage execution
- Format: `{stage_name}_{run_id_first_8}_{timestamp_ms}`
- Example: `lead_scoring_abc12345_1705326000000`
- Stored in workflow_runs per stage record
- Used for stage-level debugging

---

## Required Trace Attributes

Every workflow_runs record must include:

```json
{
  "run_id": "uuid",
  "trace_id": "string",
  "stage": "stage_name",
  "agent": "agent_name",
  "lane": "lane_name or null",
  "status": "running|completed|failed|blocked",
  "attempt": 1,
  "created_at": "ISO 8601"
}
```

---

## Trace Propagation

When one agent calls another:
1. Parent agent passes `run_id` to child agent
2. Child agent generates its own `trace_id` for its stage
3. Child agent stores `provenance.parent_run_id` pointing to parent's run_id
4. This creates a linked chain even across parallel executions

---

## Trace Lifecycle

```
Stage start:
  Write workflow_run: { status: 'running', trace_id: new_id, created_at: now() }

Stage complete:
  Update workflow_run: { status: 'completed', output_snapshot: {...}, completed_at: now() }

Stage fail:
  Update workflow_run: { status: 'failed', error_metadata: {...} }

Approval gate:
  Update workflow_run: { status: 'blocked' }

Replay:
  Update existing: { status: 'replaying', attempt: attempt+1 }
  New record created for replay execution
```

---

## Trace Search

To find all records for a specific workflow execution:
```sql
SELECT * FROM workflow_runs WHERE run_id = 'uuid' ORDER BY created_at;
```

To find all stages across a replay chain:
```sql
SELECT * FROM workflow_runs 
WHERE run_id = 'uuid' OR provenance->>'parent_run_id' = 'uuid'
ORDER BY created_at;
```

---

## OpenTelemetry Export (Future)

When Sentry or another OTel-compatible observability tool is configured (SENTRY_DSN):
- Traces will export as OpenTelemetry spans
- run_id maps to the trace root
- trace_id maps to span ID
- stage maps to span name
- agent maps to instrumentation scope

Until then: Supabase workflow_runs is the trace store.
