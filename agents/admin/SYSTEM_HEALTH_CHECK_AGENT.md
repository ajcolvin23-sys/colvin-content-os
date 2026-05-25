# System Health Check Agent — Colvin Content OS

Runs every 30 minutes. Checks all provider connections and reports system status.

---

## Health Check Schedule

Every 30 minutes via Vercel Cron: `*/30 * * * *`
Protected by `CRON_SECRET` header.

---

## Checks Per Run

### Supabase (iuzlbtfevzkerehmluqj)
```
Test: SELECT 1 FROM workflow_runs LIMIT 1
Pass: HTTP 200, response < 2 seconds
Fail: Connection error, timeout, or auth failure
Action on fail: P1 incident, Telegram alert
```

### OpenAI API
```
Test: GET https://api.openai.com/v1/models (or minimal test completion)
Pass: HTTP 200
Fail: HTTP 401 (auth), 503, or timeout
Action on fail: Open circuit breaker, P2 incident if persists > 2 checks
```

### Telegram Bot
```
Test: GET https://api.telegram.org/bot{TOKEN}/getMe
Pass: {"ok": true, "result": {...}}
Fail: Any error
Action on fail: P2 incident, log alerts to Supabase only
```

### Firecrawl MCP
```
Test: Scrape https://example.com (simple, reliable test URL)
Pass: Returns page content
Fail: Error or timeout
Action on fail: P2 incident if 2+ consecutive failures
```

### Playwright MCP
```
Test: Launch browser, navigate to about:blank, get title
Pass: Returns empty string or "about:blank"
Fail: Browser launch error
Action on fail: P3 incident
```

### Remotion MCP
```
Test: List compositions endpoint
Pass: Returns composition list
Fail: Connection error
Action on fail: P2 incident, pause render pipeline
```

### Review Queue Depth
```
Check: SELECT COUNT(*) FROM review_tickets WHERE status = 'pending'
Alert threshold: > 20 items → Telegram notification to Alfred
Block threshold: > 50 items → P2 incident
```

### Missed Cron Detection
```
Check: For each daily workflow, was it run today?
Expected completion times:
  - system_health_check: 6 AM ET
  - daily_lead_workflow: 7 AM ET
  - daily_marketing_workflow: 8 AM ET
Alert: If not completed by expected time + 1 hour
```

---

## Health Status Output

```json
{
  "check_id": "uuid",
  "timestamp": "ISO 8601",
  "overall_status": "healthy" | "degraded" | "down",
  "checks": {
    "supabase": { "status": "pass", "latency_ms": 45 },
    "openai": { "status": "pass", "latency_ms": 320 },
    "telegram": { "status": "pass" },
    "firecrawl": { "status": "pass" },
    "playwright": { "status": "pass" },
    "remotion": { "status": "fail", "error": "connection_refused" },
    "review_queue_depth": { "count": 7, "status": "ok" }
  },
  "incidents_created": ["uuid if any"]
}
```

Health check results stored in Supabase `system_health` table (30-day retention).

---

## Circuit Breaker Integration

Health check results feed directly into circuit breaker state:
- 2 consecutive failures: open circuit breaker for that provider
- 1 success after open: move to half-open
- 3 consecutive successes after half-open: close circuit

---

## Integration Status

IMPLEMENTED (partial): automation-os/ has health check infrastructure
REQUIRES SETUP: Full 30-minute cron schedule via Vercel
