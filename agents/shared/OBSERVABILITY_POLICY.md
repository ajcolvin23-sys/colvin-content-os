# Observability Policy — Colvin Content OS

---

## Observability Stack

- **Traces:** run_id (root) + trace_id (per stage) — stored in Supabase workflow_runs
- **Metrics:** derived from Supabase queries — no external metrics service required in Phase 1-4
- **Logs:** Supabase workflow_runs + Vercel function logs
- **Alerts:** Telegram bot notifications to Alfred's chat
- **Dashboards:** Next.js dashboard at `/dashboard` (Phase 5)
- **Error tracking:** Sentry (optional, requires SENTRY_DSN)

---

## Trace Structure (OpenTelemetry-Aligned)

```
root span: run_id (UUID) — one per workflow execution
  child span: trace_id — one per stage
    attributes:
      - stage: string
      - agent: string
      - lane: string | null
      - status: enum
      - attempt: integer
      - duration_ms: integer
```

Every Supabase insert to `workflow_runs` is one span.

---

## Key Metrics

### Scheduler Metrics
- Runs started per day
- Runs completed per day
- Runs missed (scheduled but not started)
- Median run duration

### Pipeline Metrics
- Stage success rate per workflow
- Median stage latency
- Queue depth (review_tickets pending)
- Items processed per run

### Adapter Metrics
- Error rate per provider (OpenAI, Firecrawl, Supabase, Telegram, Remotion)
- Retry count per provider
- Rate-limit events per provider
- Circuit breaker state (open/half-open/closed)

### Model Behavior Metrics
- Schema-valid outputs percentage
- Compliance flag rate per lane
- Hallucination flags raised (from ANTI_HALLUCINATION_POLICY.md)
- Human approval rate (approved vs rejected vs revision requested)

### Data Quality Metrics
- Dedupe ratio (skips / total attempts)
- Lead enrichment coverage (% of leads with email, % with company)
- Lead score distribution per lane
- Confidence score distribution

### Human Review Metrics
- Approval rate
- Rejection rate
- Revision request rate
- Average review time
- Queue depth over time

### Send/Publish/Render Layer
- Outreach drafts created vs approved vs sent
- Content pieces created vs approved vs published
- Remotion blueprints created → approved → rendered → QA passed

---

## Alert Thresholds

See `/agents/observability/ALERT_RULES.md` for full alert conditions.

Critical alerts (immediate Telegram notification):
- Gabriel daily run missed
- Supabase connection failure
- P1 incident open > 30 minutes
- API error rate > 20% on any provider
- Review queue > 50 items
- Circuit breaker open on OpenAI or Supabase

---

## Dashboard Sections (Phase 5)

See `/agents/observability/DASHBOARD_PLAN.md` for full plan.

1. System Health — all provider statuses
2. Pipeline Metrics — runs, stages, success rates
3. Agent Performance — per-agent stats
4. Review Queue — pending, approved, rejected counts
5. Remotion Render Status — blueprint → render → QA
6. Lead Pipeline — find → score → queue → approve → contact
