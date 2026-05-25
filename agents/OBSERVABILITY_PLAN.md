# Observability Plan — Colvin Content OS

Full monitoring strategy for all agents, workflows, and adapters.

---

## Observability Stack

| Layer | Tool | Purpose | Status |
|-------|------|---------|--------|
| Trace storage | Supabase `workflow_runs` table | All pipeline stage records | PLANNED (Phase 1) |
| Alert delivery | Telegram bot | P1/P2 alerts + daily brief | REQUIRES SETUP |
| Dashboard | Next.js `/app/dashboard` | Alfred's primary visibility interface | PLANNED (Phase 5) |
| Metrics | Supabase queries | All metrics derived from workflow_runs | PLANNED (Phase 1) |
| Synthetic tests | Cron every 30 min | Production health pings | PLANNED (Phase 5) |
| Log masking | TypeScript middleware | PII and key masking in all logs | PLANNED (Phase 1) |
| Future: OpenTelemetry export | OTEL collector | If system grows beyond Supabase scale | FUTURE |

---

## Trace Architecture

Every workflow run has:
- `run_id` — root UUID, created by Hermes at workflow start, shared by all stages in the run
- `trace_id` — stage-level UUID, unique per stage execution

```
run_id: abc123
  ├── trace_id: t001 (Stage 1: Pre-flight)
  ├── trace_id: t002 (Stage 2: Niche Research — lane: indiana_backflow)
  ├── trace_id: t003 (Stage 2: Niche Research — lane: colvin_enterprises)
  ├── trace_id: t004 (Stage 3: Lead Finding — lane: indiana_backflow)
  └── ...
```

Required attributes on every `workflow_run` record:
- `run_id` + `trace_id`
- `workflow_name` (e.g., `DAILY_LEAD_WORKFLOW`)
- `stage` (e.g., `stage_3_lead_finding`)
- `agent` (e.g., `lead_finder_agent`)
- `lane` (or `all` for cross-lane stages)
- `status` (pending | running | completed | failed | blocked | replaying | skipped)
- `started_at` + `completed_at`
- `attempt` (1 = first try, 2 = first replay, etc.)
- `input_snapshot` (JSON — inputs to this stage)
- `output_snapshot` (JSON — outputs from this stage)
- `error_metadata` (if failed)

---

## Dashboard Plan

Six dashboard sections, ordered by build priority:

### /app/dashboard/review (Build First — Phase 1)
Alfred's approval queue. Every item requiring his decision.
- Pending tickets sorted by priority_score
- Quick approve/reject/revision buttons
- Compliance flag indicators
- Telegram deep-link for quick access

### /app/dashboard/health (Phase 5)
Real-time adapter health.
- Status indicator per adapter: Supabase | OpenAI | Telegram | Firecrawl | Remotion | Gemini
- Circuit breaker state per provider (CLOSED / OPEN / HALF-OPEN)
- Last successful check timestamp
- Active incidents

### /app/dashboard/pipeline (Phase 5)
Today's workflow run status.
- Each workflow: last run time, status, stages completed
- Stage-by-stage progress indicator
- Run errors with links to DLQ items
- Replay controls for Hermes-authorized replays

### /app/dashboard/leads (Phase 5)
CRM summary view.
- New leads today by lane
- Leads in outreach queue
- Outreach drafts pending approval
- Sent/contacted this week
- Contact window expiry alerts

### /app/dashboard/renders (Phase 5)
Remotion render pipeline status.
- Blueprints in review queue
- Active renders (with % complete)
- Completed renders with video URL + delivery status
- Failed renders with error detail

### /app/dashboard/agents (Phase 5)
Agent performance summary.
- Run counts per agent (24h / 7d / 30d)
- Success rate per agent
- Average run duration
- Top error types per agent

---

## Alert Rules Summary

See `observability/ALERT_RULES.md` for full detail.

**P1 — Immediate Telegram alert:**
- Production workflow completely down (>2 consecutive daily run failures)
- Compliance violation in published content
- API key compromise suspected
- Data integrity failure

**P2 — Telegram alert within 10 minutes:**
- Circuit breaker open for any adapter
- Review queue > 50 items
- Any daily cron missed
- Supabase connection failure
- OpenAI quota exceeded

**P3 — Included in daily report:**
- Single stage failure (non-blocking)
- Lead scoring anomaly
- Schema validation quarantine

---

## Key Metrics

| Category | Metric | Alert Threshold |
|----------|--------|----------------|
| Scheduler | Daily cron completion rate | < 100% = P2 |
| Pipeline | Stage success rate (24h) | < 90% = P2 |
| Adapters | API error rate per provider | > 5% = P2, circuit opens at 5 consecutive |
| Data quality | Schema validation pass rate | < 98% = P3 |
| Human review | Queue depth | > 50 pending = P2 |
| Review latency | Avg time from draft to Alfred approval | > 48 hours = P3 |
| Remotion | Render success rate | < 80% = P2 |
| Lead pipeline | Daily new leads found | 0 for 2 days = P2 |

---

## Logging Rules

What to log (see `LOGGING_POLICY.md`):
- All workflow stage start/complete/fail events
- All API calls with provider, duration, status code
- All schema validation results
- All review ticket creation events
- All circuit breaker state transitions
- All retry attempts
- All incident creation events

What NOT to log:
- API key values (even partial)
- Email body content (log only metadata: recipient_id, lane, draft_id)
- Lead personal details in error messages (log lead_id only)
- PII of any kind
- Supabase connection strings

Masking rules: See `observability/LOGGING_MASKING_RULES.md`.

---

## Synthetic Tests

Every 30 minutes in production:
1. Supabase connection ping
2. OpenAI models endpoint ping
3. Telegram getMe ping
4. gabriel-config.json loadable check
5. Last Gabriel daily run < 25 hours ago check
6. Review queue depth check (< 50)
7. All 7 schema files parse without error

Results stored in `workflow_runs` with `workflow_name: 'SYNTHETIC_TEST'`.

Alert if 2 consecutive failures for any synthetic test.

---

## OpenTelemetry Export (Future)

When the system grows beyond what Supabase queries can handle:
- Export `workflow_runs` events to an OTEL collector
- Use Honeycomb, Grafana, or Datadog for distributed trace visualization
- `run_id` maps to OTEL `trace_id`
- `trace_id` maps to OTEL `span_id`

This is Phase 6+ work — not needed until volume is much higher.

---

## Integration Status

Observability PLANNED — Phase 1 (data layer) and Phase 5 (full dashboard).
Telegram alerts: REQUIRES SETUP (bot token + chat ID already available).
Supabase workflow_runs table: PLANNED (Phase 1 schema migration).
Dashboard: PLANNED (Phase 5 Next.js build).
