# Hermes Supervisor — Colvin Content OS

Hermes monitors all agents, enforces health checks, manages circuit breakers, and creates incidents.

---

## Health Check Schedule

| Check | Interval | Timeout |
|-------|---------|---------|
| Full system health check | Every 5 minutes | 30 seconds |
| Provider ping (OpenAI, Supabase, Telegram) | Every 5 minutes | 10 seconds |
| Review queue depth check | Every 10 minutes | — |
| Circuit breaker state evaluation | Every 2 minutes | — |
| Gabriel daily run completion check | Once daily at 8 PM ET | — |
| Missed cron detection | Every 30 minutes | — |

---

## Health Check Targets

### Supabase (iuzlbtfevzkerehmluqj)
- Ping: simple SELECT from workflow_runs LIMIT 1
- Pass: response < 2 seconds
- Fail: timeout or connection error
- On fail: P1 incident, Telegram alert, halt all DB writes

### OpenAI
- Ping: minimal completion call (1 token) or models list endpoint
- Pass: HTTP 200 < 5 seconds
- Fail: HTTP error or timeout
- On fail: open circuit breaker, fallback to Gemini if available

### Telegram Bot
- Ping: `getMe` API call
- Pass: returns bot info
- Fail: any error
- On fail: P2 incident, log alerts to Supabase only

### Firecrawl MCP
- Ping: scrape a known test URL (e.g., example.com)
- Pass: valid response
- Fail: error or timeout
- On fail: pause all lead generation workflows, P2 incident

### Playwright MCP
- Ping: launch browser and get page title for about:blank
- Pass: success
- Fail: error
- On fail: pause Playwright-dependent workflows, P3 incident

### Remotion MCP
- Ping: list compositions endpoint
- Pass: valid response
- Fail: error
- On fail: pause render pipeline, P2 incident

---

## Circuit Breaker Logic

Each provider has its own circuit breaker with three states:

### Closed (Normal)
- Requests flow through normally
- Track failure rate over 5-minute sliding window

### Open (Tripped)
- Triggered when: 5+ failures in 5 minutes, OR error rate > 40%
- All requests to this provider are blocked
- Hermes serves fallback or queues for later
- Open for minimum 60 seconds before probe

### Half-Open (Probing)
- After 60 seconds in Open state
- Hermes sends 1 probe request
- If probe succeeds: move to Closed
- If probe fails: reset timer, remain Open for another 60 seconds

```
Circuit State Machine:
Closed → (5 failures/5min) → Open
Open → (60s elapsed) → Half-Open
Half-Open → (probe succeeds) → Closed
Half-Open → (probe fails) → Open
```

---

## Circuit Breaker State Per Provider

| Provider | Fallback When Open |
|----------|-------------------|
| OpenAI | Queue for later; fallback to Gemini if available |
| Supabase | Write to in-memory buffer; alert P1; do not lose data |
| Firecrawl | Pause lead generation; queue tasks |
| Telegram | Write alerts to Supabase; retry on close |
| Remotion MCP | Pause render pipeline; queue blueprints |
| Playwright | Pause web scraping; queue tasks |

---

## Incident Creation Rules

Hermes creates incidents when:

| Condition | Severity |
|-----------|---------|
| Supabase connection failure | P1 |
| OpenAI auth failure (account suspended) | P1 |
| Any API key compromised/leaked | P1 |
| P1 incident unresolved > 30 minutes | P1 (re-escalate) |
| Missing Gabriel daily run | P2 |
| OpenAI quota exceeded | P2 |
| Firecrawl consecutive failures | P2 |
| Review queue > 50 items | P2 |
| Remotion render failing > 3 consecutive | P2 |
| Schema validation failure > 5 in one run | P2 |
| Telegram bot not responding | P2 |
| Missing scheduled cron (non-critical) | P3 |
| Dedup rate > 50% in one run | P3 |
| Single API timeout (retried successfully) | No incident |

---

## Agent Monitoring

Hermes tracks agent health by monitoring workflow_runs:
- An agent is "healthy" if its last 5 runs have status = completed
- An agent is "degraded" if > 20% of runs in last hour have status = failed
- An agent is "down" if its circuit breaker is open or last run > 2x expected duration

Agent health is reported in the DAILY_REPORT.

---

## Supervisor Alerts

All P1 alerts sent to Alfred via Telegram within 2 minutes of detection.
P2 alerts sent within 10 minutes.
P3 alerts included in daily report, not immediate.

Telegram message format:
```
🚨 [P1] Colvin Content OS Incident
Stage: {failed_stage}
Cause: {cause}
Run ID: {run_id}
Recommended Fix: {recommended_fix}
Action Required: Reply with /acknowledge or check dashboard
```

Integration Status: IMPLEMENTED (Telegram bot configured in automation-os/)
