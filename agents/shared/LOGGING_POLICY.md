# Logging Policy — Colvin Content OS

---

## What to Log

Every agent stage must emit a structured log entry to Supabase `workflow_runs` table on:
- Stage start (`status: running`)
- Stage completion (`status: completed`)
- Stage failure (`status: failed`)
- Retry attempt (increment `retry_count`)
- Human approval gate triggered (`status: blocked`)

Minimum fields per log entry:
- `run_id` — workflow root span
- `trace_id` — stage trace
- `stage` — stage name
- `agent` — agent name
- `status` — current status
- `attempt` — attempt number
- `created_at` — ISO 8601 timestamp

---

## What Not to Log

**NEVER log:**
- API keys or tokens (any form: full, partial, base64)
- Passwords
- Full email addresses in free-text fields (use masked form: `a***@domain.com`)
- Phone numbers in free-text (mask: `***-***-XXXX`)
- Full names in context where they constitute PII
- SSNs, financial account numbers
- Minors' personal data (Girls Got Game lane)
- Voiceover scripts that contain unverified personal details

See LOGGING_MASKING_RULES.md for masking patterns.

---

## Log Destinations

| Log Type | Destination | Retention |
|----------|------------|-----------|
| Workflow run events | Supabase `workflow_runs` table | 90 days |
| Incidents | Supabase `incidents` table | 1 year |
| Console/CI logs | Vercel function logs | 7 days (Vercel default) |
| Error traces | Sentry (if SENTRY_DSN configured) | 30 days |
| Health check results | Supabase `system_health` table | 30 days |

---

## Log Levels

| Level | Use Case |
|-------|---------|
| `info` | Normal stage completion, item counts |
| `warn` | Retries, degraded quality, compliance warnings |
| `error` | Stage failures, API errors, schema failures |
| `debug` | Detailed trace data — only in development, never in production |

---

## Structured Log Format

All logs emitted by agents should follow this structure:
```json
{
  "level": "info|warn|error",
  "timestamp": "ISO 8601",
  "run_id": "uuid",
  "trace_id": "string",
  "stage": "string",
  "agent": "string",
  "lane": "string|null",
  "message": "string",
  "metadata": {}
}
```

---

## Log Retention and Purge

- `workflow_runs`: auto-purge after 90 days (Supabase scheduled job)
- `incidents`: archive to cold storage after 1 year
- Vercel logs: follow Vercel's default retention (7 days on free tier)
- Do not build log aggregation until observability dashboard is in Phase 5

---

## Log Review Schedule

- Error logs: Daily review by `ERROR_LOG_REVIEW_AGENT.md`
- Weekly pattern analysis: surfaced in `DAILY_REPORT_AGENT.md`
- On incident: immediate log review as part of incident response
