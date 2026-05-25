# Rate Limit Policy — Colvin Content OS

All agents must respect the following rate limits. On 429 responses, follow SELF_REPAIR_POLICY.md retry logic.

---

## Provider Rate Limits

### OpenAI
| Tier | TPM (tokens/min) | RPM (requests/min) | Notes |
|------|-----------------|-------------------|-------|
| Tier 1 | 200,000 | 500 | Default new account |
| Tier 2 | 2,000,000 | 5,000 | After $50 spend |
| Tier 3+ | Higher | Higher | After more spend |

**Agent rules:**
- Never make parallel requests that could exceed current tier
- Default: max 10 concurrent OpenAI calls
- If 429 received: exponential backoff starting at 5 seconds
- If 429s persist > 5 minutes: create P2 incident, alert Alfred
- Prefer batching with prompt caching for repeated context (cuts tokens by 60-90%)

### Firecrawl (via MCP)
- Default rate: 500 requests/min (check current Firecrawl plan)
- Per-domain: max 1 request/second to any single domain
- If 429: back off 30 seconds before retry
- Never scrape same URL twice within 1 hour

### Telegram Bot API
- Max 30 messages/second globally
- Max 1 message/second per chat
- Bulk notifications: spread across 10 seconds
- If bot blocked by user: mark as `do_not_contact` via Telegram

### Supabase (iuzlbtfevzkerehmluqj)
- Free tier: 500 requests/second
- If approaching limit: batch inserts, use transactions
- Connection pool: max 10 concurrent connections from agents
- On connection failure: retry 3x with 2-second backoff, then P1 incident

### LinkedIn (if LinkedIn API used in future)
- Connection requests: max 20/day (conservative, LinkedIn policy varies)
- No automated scraping
- All LinkedIn activity is manual + Claude-assisted research only

### Playwright / Browser Automation
- Max 2 concurrent browser sessions
- Per-site crawl: max 1 req/second
- Rate limit headers: always honor `Retry-After`

### Remotion MCP
- Render queue: max 3 concurrent renders
- Each render: up to 15 minutes before timeout alert
- Failed render: max 2 retry attempts before human review

### Google / Gemini MCP
- Gemini Flash: 15 RPM on free tier, 1500 RPM on paid
- Gemini Pro: 2 RPM free, 360 RPM paid
- If quota exceeded: fallback to OpenAI GPT-4o, create P3 incident

---

## 429 Handling Decision Tree

```
Receive 429 from provider
  → Is Retry-After header present?
      → Yes: Wait exactly Retry-After seconds, then retry
      → No: Use exponential backoff
          Attempt 1: wait 5 seconds
          Attempt 2: wait 15 seconds
          Attempt 3: wait 45 seconds
          Attempt 4: wait 120 seconds
          Attempt 5+: create P2 incident, stop retrying
  → Add jitter: ±20% random to each wait time
  → Log each retry in workflow_runs with error_metadata.code = 'HTTP_429'
```

---

## Circuit Breaker Thresholds

When a provider fails 5+ times in 5 minutes, open the circuit breaker:
- OpenAI circuit open: fallback to Gemini if available, else queue for later
- Supabase circuit open: write to local buffer, alert Alfred as P1
- Firecrawl circuit open: pause all scraping workflows, alert as P2
- Telegram circuit open: log alerts to Supabase, retry every 5 minutes

See HERMES_SUPERVISOR.md for full circuit breaker logic.
