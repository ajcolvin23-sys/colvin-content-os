# Error Log Review Agent — Colvin Content OS

Daily error log analysis. Categorize errors, identify patterns, generate fix recommendations.

---

## Schedule

Daily at 8:00 PM ET (after all workflows complete): `0 20 * * *`

---

## Error Collection

Query Supabase workflow_runs for last 24 hours:
```sql
SELECT 
  stage,
  agent,
  error_metadata->>'code' as error_code,
  error_metadata->>'message' as error_message,
  error_metadata->>'is_retryable' as retryable,
  retry_count,
  created_at
FROM workflow_runs 
WHERE status = 'failed' 
  AND created_at > now() - interval '24 hours'
ORDER BY created_at DESC;
```

---

## Error Categorization

### Transient Errors (Expected, Auto-Recovered)
- HTTP_429: Rate limit — check rate_count. If > 3: investigation needed
- HTTP_503: Service unavailable — check if provider had outage
- NETWORK_TIMEOUT: Network issue — usually auto-recovered

### Schema Errors (Needs Attention)
- SCHEMA_VALIDATION_FAILURE: Which fields failed? Pattern? LLM output format issue?
- If > 3 schema failures per stage per day: prompt or schema change needed

### Policy Violations (Always Investigate)
- POLICY_VIOLATION_*: Why? Was it a new content type? New lead source?
- Always include in daily report regardless of resolution

### Configuration Errors (Fix Required)
- MISSING_ENV_VAR: Which variable? Is it set?
- Circuit breaker open: Why? How long?

---

## Error Pattern Analysis

Look for recurring patterns:
- Same error code appearing multiple times for same stage
- Same agent failing repeatedly
- Error rate increasing over time (could indicate API degradation)
- Schema failures concentrated in one lane (could indicate brand voice drift)

---

## Daily Error Report Section

Included in DAILY_REPORT_AGENT output:

```
## Error Summary (Last 24 Hours)

Transient errors (auto-resolved): 3
  - HTTP_429 on openai (lead_enrichment stage) — 1 retry needed
  - NETWORK_TIMEOUT on firecrawl (2) — both auto-recovered

Schema errors: 1
  - music_theory_secrets content — missing 'hashtags' field
  - Auto-regenerated and resolved ✓

Policy violations: 0

Configuration errors: 0

Pattern flag: firecrawl timeouts increasing (3 in last 5 days)
Recommendation: Reduce concurrency on firecrawl scraping
```

---

## Escalation

If daily error review detects:
- Policy violation: Escalate to P2 regardless of auto-resolution
- Schema failure rate > 10% for any stage: Notify Alfred in daily report with yellow flag
- Same error 3+ days in a row: Notify Alfred with red flag
- Any security-adjacent error: Escalate to P1, immediate Telegram alert
