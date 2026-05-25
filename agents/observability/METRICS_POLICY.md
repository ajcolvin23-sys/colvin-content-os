# Metrics Policy — Colvin Content OS

All metrics to track. How they're collected, stored, and queried.

---

## Metrics Storage

All metrics are derived from Supabase tables — no external metrics service required in Phase 1-4.
Phase 5: Optional Sentry integration for enhanced monitoring.

---

## Scheduler Metrics

Collected from: `workflow_runs` WHERE source = 'cron' or 'manual'

| Metric | Query | Alert Threshold |
|--------|-------|----------------|
| Runs started per day | COUNT(*) WHERE created_at::date = today | < 1 per workflow = missed run alert |
| Runs completed per day | COUNT(*) WHERE status = 'completed' | < 1 = P2 |
| Runs missed | Expected - actual | > 0 = P2 alert |
| Median run duration | PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration_ms) | > 2x baseline = P3 |

---

## Pipeline Metrics

Collected from: `workflow_runs` all records

| Metric | Query | Alert Threshold |
|--------|-------|----------------|
| Stage success rate | COUNT(completed) / COUNT(*) per stage | < 80% = P3 |
| Median stage latency | PERCENTILE_CONT by stage | > 3x baseline = P3 |
| Queue depth | COUNT(review_tickets WHERE status = 'pending') | > 50 = P2 |
| Items processed per run | SUM(items_processed) by run_id | < 1 = investigate |

---

## Adapter Metrics

Collected from: `workflow_runs.error_metadata`

| Metric | How | Alert Threshold |
|--------|-----|----------------|
| Error rate per provider | COUNT(error_metadata->>'code' LIKE 'HTTP_%') / total calls | > 20% = P2 |
| Retry count | AVG(retry_count) per stage | > 2 avg = investigate |
| Rate-limit events | COUNT WHERE error_code = 'HTTP_429' | > 5/hour = P3 |
| Circuit breaker state | system_health.checks.{provider}.circuit_state | open = P2 |

---

## Model Behavior Metrics

Collected from: content/outreach/workflow records

| Metric | How | Alert Threshold |
|--------|-----|----------------|
| Schema-valid output rate | COUNT(schema_validated=true) / COUNT(*) | < 90% = P3 |
| Compliance flag rate | COUNT(compliance_flags.length > 0) / COUNT(*) | > 30% = review prompts |
| Hallucination flags | COUNT(anti_hallucination_flags) | > 0 = immediate review |
| Approval rate | COUNT(status='approved') / COUNT(*) by type | < 60% = content quality issue |
| Rejection reasons | alfred_feedback analysis | N/A — qualitative |

---

## Data Quality Metrics

Collected from: `leads` table

| Metric | Query | Alert Threshold |
|--------|-------|----------------|
| Dedup ratio | COUNT(idempotency_skips) / COUNT(total_attempts) | > 50% = P3 |
| Enrichment coverage (email) | COUNT(email IS NOT NULL) / COUNT(*) | < 20% = investigate sources |
| Lead score distribution | GROUP BY score range | If 0-4 > 70% = ICP targeting issue |
| Confidence score distribution | AVG(confidence) by lane | < 0.6 avg = source quality issue |

---

## Human Review Metrics

Collected from: `review_tickets` table

| Metric | Query | Alert Threshold |
|--------|-------|----------------|
| Approval rate | COUNT(status='approved') / COUNT(decided) | < 50% = content quality issue |
| Rejection rate | COUNT(status='rejected') / COUNT(decided) | > 30% = agent tuning needed |
| Revision request rate | COUNT(status='revision_requested') / COUNT(decided) | > 20% = voice tuning needed |
| Average review time | AVG(decided_at - created_at) | > 24 hours = queue too deep |
| Queue depth over time | daily snapshot of pending count | > 50 = P2 |

---

## Send/Publish/Render Layer

| Metric | Source | Notes |
|--------|--------|-------|
| Outreach drafts created vs approved | outreach table | Conversion funnel |
| Content created vs published | content table | Publishing rate |
| Blueprints created → approved → rendered → QA pass | remotion_videos | Full render funnel |
| QA pass rate | remotion_videos.render_qa | < 90% = component issues |

---

## Weekly Metrics Review

Every Monday: Admin QA Agent generates metrics summary:
- Trend vs last week for each key metric
- Any metrics that crossed alert thresholds
- Recommended adjustments based on patterns
- Included in Alfred's weekly briefing
