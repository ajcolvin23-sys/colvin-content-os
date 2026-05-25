# Self-Repair Policy — Colvin Content OS

Hermes self-repair covers all failure scenarios with specific recovery actions per failure class.

---

## Failure Matrix

### 1. Transient HTTP 429 (Rate Limit)

**Trigger:** Provider returns HTTP 429
**Classification:** Recoverable, auto-retry

**Recovery sequence:**
1. Check `Retry-After` header — if present, wait exactly that duration
2. If no header: exponential backoff with jitter
   - Attempt 1: wait 5s ± 20% jitter
   - Attempt 2: wait 15s ± 20% jitter
   - Attempt 3: wait 45s ± 20% jitter
   - Attempt 4: wait 120s ± 20% jitter
3. After 5 failed attempts: open circuit breaker, create P2 incident
4. Log every retry to workflow_runs (retry_count++)

**Circuit breaker threshold:** 5 rate limit errors from same provider in 5 minutes

---

### 2. Transient HTTP 503 / Timeout / Network Error

**Trigger:** Provider unavailable or network timeout
**Classification:** Recoverable, auto-retry

**Recovery sequence:**
1. Retry 3 times: 10s → 30s → 90s backoff
2. On 3rd failure: check if circuit breaker should open
3. If circuit opens: serve fallback or queue for later
4. Create P3 incident if affecting a critical path

---

### 3. Repeated Dependency Failure (Circuit Breaker)

**Trigger:** Provider fails 5+ times in 5 minutes
**Classification:** Circuit breaker intervention

**Recovery sequence:**
1. Open circuit breaker immediately
2. Block all requests to that provider
3. Activate fallback:
   - OpenAI down → use Gemini if available
   - Supabase down → write to memory buffer, alert P1
   - Firecrawl down → pause lead generation
   - Telegram down → log alerts to Supabase
4. Probe circuit every 60 seconds (half-open state)
5. On successful probe: close circuit, resume normal operation
6. Alert Alfred via Telegram if P1/P2 impact

---

### 4. Schema Validation Failure

**Trigger:** Agent output fails JSON Schema Draft-07 validation
**Classification:** Recoverable (once)

**Recovery sequence:**
1. Log validation errors with full field-level detail
2. Quarantine the failed record (status: `quarantine`)
3. Re-run the stage with stricter prompt constraints:
   - Include the schema as part of the system prompt
   - Enumerate the specific fields that failed
   - Add "Return ONLY valid JSON matching the schema" instruction
4. Validate the regenerated output
5. If regenerated output also fails: escalate to P3, create review ticket
6. Increment `error_metadata.code = 'SCHEMA_VALIDATION_FAILURE'` in workflow_runs

---

### 5. Policy Violation

**Trigger:** Compliance check returns `severity: block`, or agent attempts unauthorized action
**Classification:** Non-retryable — block + review

**Recovery sequence:**
1. STOP workflow stage immediately
2. Do NOT retry with same inputs
3. Set workflow_runs status = `blocked`
4. Create review_ticket with type = compliance or system_change
5. Set `katrina_required: true`
6. Alert Alfred via Telegram with specific violation detail
7. Wait for Alfred's decision before any further action
8. If security policy violation (agent tried to send without approval): create P1 incident

---

### 6. Missing Scheduled Run (Missed Cron)

**Trigger:** Expected workflow not started by scheduled time + 1 hour
**Classification:** Alert + conditional replay

**Recovery sequence:**
1. Detect via 30-minute health check scan of workflow_runs
2. Determine how late the miss is:
   - < 2 hours: attempt immediate replay with `source: 'missed_run_replay'`
   - 2-12 hours: create P2 incident, alert Alfred, ask permission before replay
   - > 12 hours: create P2 incident, alert Alfred, do NOT auto-replay (data may be stale)
3. Log missed run with expected time and actual detection time
4. After replay: verify outputs are date-appropriate (no stale content)

---

### 7. Data Quality Regression

**Trigger:** Lead scores drop significantly, enrichment coverage decreases, schema valid rate drops
**Classification:** Alert + hold

**Recovery sequence:**
1. Detect via Admin QA Agent daily checks
2. Lower confidence scores on affected records
3. Move affected records to `status: hold` — do not send to outreach queue
4. Generate data quality report
5. Alert Alfred via daily report (P3) or Telegram (P2 if > 20% regression)
6. Human review before unholding records

---

### 8. Duplicate Send/Publish Risk

**Trigger:** Idempotency check fails to prevent duplicate, OR duplicate detected post-insert
**Classification:** Human review required

**Recovery sequence:**
1. Immediately halt any pending send/publish
2. Check if duplicate was already sent/published
   - If not yet sent: archive the duplicate, continue with original
   - If already sent: create P1 incident "DUPLICATE_SEND_RISK", alert Alfred immediately
3. Investigate idempotency key generation — why did it fail?
4. Do not resume similar operations until root cause identified
5. Alfred decision on whether to apologize to recipient or take other action

---

### 9. Unrecoverable Render Failure

**Trigger:** Remotion render fails 3+ consecutive times for same blueprint
**Classification:** Archive + alert

**Recovery sequence:**
1. Stop retry attempts
2. Archive the blueprint with status = `failed`
3. Create P2 incident with render error details
4. Alert Alfred with specific render error
5. Preserve the blueprint JSON — human or developer can debug and re-trigger
6. Do not count against other pending renders in the queue

---

### 10. Missing Environment Variable

**Trigger:** `process.env.KEY_NAME` is undefined at runtime
**Classification:** Fatal — halt workflow

**Recovery sequence:**
1. Log specific missing variable name (never its value)
2. Create P2 incident: "MISSING_ENV_VAR: {VAR_NAME}"
3. Alert Alfred via Telegram
4. Halt the affected workflow — do not continue with missing config
5. Do not retry until variable is confirmed set and verified

---

## Retry Exhaustion Handling

When all retries are exhausted for any failure:
1. Set workflow stage to `failed` in workflow_runs
2. Preserve all stage state for potential manual replay
3. Create incident at appropriate severity
4. Alert Alfred
5. Continue other independent stages if possible (do not fail entire workflow for one stage)
