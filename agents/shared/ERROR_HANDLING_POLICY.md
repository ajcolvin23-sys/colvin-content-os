# Error Handling Policy — Colvin Content OS

---

## Error Taxonomy

### Class 1: Transient Errors (Auto-Retry)
These errors are expected to resolve with retry.

| Code | Description | Retry Strategy |
|------|-------------|----------------|
| `HTTP_429` | Rate limit exceeded | Exponential backoff + jitter per RATE_LIMIT_POLICY.md |
| `HTTP_503` | Service temporarily unavailable | 3 retries, 10s/30s/90s |
| `HTTP_502` | Bad gateway | 3 retries, 5s/15s/45s |
| `HTTP_504` | Gateway timeout | 3 retries, 10s/30s/90s |
| `NETWORK_TIMEOUT` | Network timeout | 3 retries with backoff |
| `CONNECTION_RESET` | Connection reset | 2 retries, 5s/15s |

### Class 2: Recoverable Errors (Partial Auto-Retry)
May recover with different approach.

| Code | Description | Recovery Action |
|------|-------------|----------------|
| `SCHEMA_VALIDATION_FAILURE` | Output doesn't match schema | Quarantine record, regenerate with stricter prompt |
| `PARTIAL_DATA` | Required field missing from source | Enrich via fallback source, or set null + flag |
| `CONTENT_TOO_LONG` | Exceeds platform limit | Truncate or regenerate with length constraint |
| `DUPLICATE_DETECTED` | Idempotency check failed | Skip gracefully, log dedup event |
| `CIRCUIT_BREAKER_HALF_OPEN` | Probe request to test recovery | Single test request, then decide |

### Class 3: Policy Violations (Block + Review)
Never auto-retry. Require human decision.

| Code | Description | Action |
|------|-------------|--------|
| `POLICY_VIOLATION_COMPLIANCE` | Content fails compliance check | Block, create review ticket, alert Alfred |
| `POLICY_VIOLATION_SECURITY` | Security policy breach | P1 incident, alert immediately |
| `POLICY_VIOLATION_YOUTH_SAFETY` | Girls Got Game safety violation | P1 incident, block all related outputs |
| `UNAUTHORIZED_ACTION_ATTEMPT` | Agent tried to send/publish without approval | P1, block agent, audit run |

### Class 4: Fatal Errors (Stop + Alert)
Cannot recover automatically.

| Code | Description | Action |
|------|-------------|--------|
| `MISSING_ENV_VAR` | Required environment variable not set | P2 incident, alert Alfred, halt workflow |
| `SUPABASE_AUTH_FAILURE` | Supabase auth rejected | P1 incident, halt all DB writes |
| `OPENAI_ACCOUNT_SUSPENDED` | OpenAI account issue | P1 incident, alert Alfred |
| `DATA_CORRUPTION_DETECTED` | Data inconsistency in Supabase | P1 incident, stop writes, investigate |
| `UNRECOVERABLE_RENDER_FAILURE` | Remotion render repeatedly fails | P2 incident, archive blueprint, alert Alfred |

---

## Error Handling Decision Tree

```
Error occurs in stage
  → Classify error class (1/2/3/4)
  → Class 1 (Transient)?
      → retry_count < 3? Retry with backoff.
      → retry_count >= 3? Escalate to Class 4 handling.
  → Class 2 (Recoverable)?
      → Schema failure? Quarantine + regenerate once.
      → Duplicate? Skip silently.
      → Still fails after one recovery? Escalate to Class 4.
  → Class 3 (Policy Violation)?
      → Block immediately.
      → Create review ticket.
      → Alert Alfred.
      → Do NOT retry.
  → Class 4 (Fatal)?
      → Stop workflow stage.
      → Log error to workflow_runs with full error_metadata.
      → Create incident with appropriate severity.
      → Alert Alfred via Telegram.
      → Wait for human resolution.
```

---

## Error Propagation

- Each stage catches its own errors — do not let uncaught exceptions crash the whole workflow
- Use `try/catch` around every external API call
- Log the error with context before re-throwing or halting
- All errors must be written to Supabase `workflow_runs.error_metadata` for traceability

---

## Error Reporting Format

When logging an error to workflow_runs:
```json
{
  "error_metadata": {
    "code": "HTTP_429",
    "message": "OpenAI rate limit exceeded on stage: lead_enrichment",
    "stack_trace": "...sanitized...",
    "is_retryable": true,
    "retry_after_seconds": 30
  }
}
```
