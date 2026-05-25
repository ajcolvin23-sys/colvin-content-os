# Synthetic Test Plan — Colvin Content OS

Synthetic monitoring tests that run every 30 minutes in production. Verify system is alive and functional.

---

## Purpose

Synthetic tests are real requests to production — not mocks. They verify the live system is working.

---

## Test Schedule

Every 30 minutes via SYSTEM_HEALTH_CHECK_AGENT (`*/30 * * * *`).
Also after every Vercel deploy.

---

## Synthetic Test Suite

### S1: API Health Pings

**OpenAI:**
```
GET https://api.openai.com/v1/models
Auth: Bearer {OPENAI_API_KEY}
Pass: HTTP 200 in < 5 seconds
Fail threshold: 2 consecutive fails → circuit breaker open
```

**Supabase:**
```
SELECT 1 FROM workflow_runs LIMIT 1
Pass: Response < 2 seconds, no error
Fail threshold: 1 fail → P1 alert
```

**Telegram:**
```
GET https://api.telegram.org/bot{TOKEN}/getMe
Pass: { ok: true }
Fail threshold: 3 consecutive fails → P2 alert
```

**Firecrawl:**
```
Scrape https://example.com
Pass: Returns page content
Fail threshold: 3 consecutive fails → P2 alert
```

### S2: Queue Depth Checks

```
SELECT COUNT(*) FROM review_tickets WHERE status = 'pending'
Alert at: > 20 (Telegram notification)
Block at: > 50 (P2 incident)
```

```
SELECT COUNT(*) FROM workflow_runs 
WHERE status = 'failed' AND created_at > now() - interval '1 hour'
Alert at: > 5 failures in 1 hour → P3 alert
```

### S3: Last Successful Run Timestamp Check

```
SELECT MAX(created_at) as last_run FROM workflow_runs 
WHERE workflow_name = 'daily_lead_workflow' AND status = 'completed'
Alert at: last_run < now() - interval '25 hours' (missed daily run)
```

### S4: Circuit Breaker State Check

```
SELECT * FROM system_health ORDER BY created_at DESC LIMIT 1
Verify: No providers in circuit_state = 'open'
Alert if: Any provider shows 'open' state in most recent health record
```

---

## Synthetic Test Results

Each test run stores results in `system_health`:
```json
{
  "check_id": "uuid",
  "check_type": "synthetic",
  "timestamp": "ISO 8601",
  "overall_status": "pass|fail",
  "tests": [
    { "name": "openai_ping", "status": "pass", "latency_ms": 312 },
    { "name": "supabase_ping", "status": "pass", "latency_ms": 44 },
    { "name": "queue_depth", "status": "pass", "count": 8 },
    { "name": "last_run_check", "status": "pass", "hours_since_run": 3.2 }
  ]
}
```

---

## Alerting from Synthetic Tests

| Failure | Severity | Alert |
|---------|---------|-------|
| Supabase unreachable | P1 | Immediate Telegram |
| OpenAI 2+ consecutive fails | P2 | Telegram in 10 min |
| Queue depth > 50 | P2 | Telegram |
| Last run > 25 hours ago | P2 | Telegram |
| Telegram unreachable | P2 | Log to Supabase only |

---

## Integration Status

PLANNED — Phase 5. Part of SYSTEM_HEALTH_CHECK_AGENT implementation.
