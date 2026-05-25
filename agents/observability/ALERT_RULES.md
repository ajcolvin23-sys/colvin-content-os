# Alert Rules — Colvin Content OS

Conditions that trigger Telegram alerts to Alfred. Organized by severity.

---

## P1 Alerts (Immediate — Target: 2 minutes)

| Condition | Trigger | Alert Message |
|-----------|---------|--------------|
| Supabase connection failure | Health check fails 2+ times in 5 min | "🚨 [P1] Supabase is unreachable. All data writes halted." |
| OpenAI account suspended | HTTP 401 on any OpenAI call | "🚨 [P1] OpenAI auth failure. Generation halted." |
| API key detected in output | Security scan detects key pattern in log | "🚨 [P1] SECURITY: API key may be exposed. Rotate immediately." |
| Unauthorized send/publish detected | Agent executes external action without approval | "🚨 [P1] POLICY VIOLATION: Unauthorized action detected." |
| HUD/RESPA violation in published content | Compliance scan on published content | "🚨 [P1] First Keys Indy content may have compliance issue. Review immediately." |
| Youth safety violation | Girls Got Game content triggers youth_safety flag | "🚨 [P1] Girls Got Game content failed youth safety check." |
| P1 incident unresolved > 30 min | Incident status = open + age > 30 min | "🚨 [P1] ESCALATION: Incident {id} unresolved for 30+ minutes." |

---

## P2 Alerts (10 minutes)

| Condition | Trigger | Alert Message |
|-----------|---------|--------------|
| Gabriel daily run missed | Run not started by 8 AM ET | "⚠️ [P2] Gabriel daily run not detected by 8 AM. Attempting replay." |
| OpenAI quota exceeded | HTTP 429 persists > 5 min | "⚠️ [P2] OpenAI quota exceeded. Generation paused." |
| Firecrawl down (consecutive failures) | 5+ Firecrawl failures in 5 min | "⚠️ [P2] Firecrawl unreachable. Lead generation paused." |
| Review queue > 50 items | Queue depth check crosses threshold | "⚠️ [P2] Review queue has 50+ items. New outreach drafts paused." |
| Remotion render failing (3+ consecutive) | 3 consecutive render failures | "⚠️ [P2] Remotion render failing consistently. Pipeline paused." |
| Missing environment variable | Env var check fails at runtime | "⚠️ [P2] Missing env var: {VAR_NAME}. Workflow halted." |
| Circuit breaker open on critical provider | Circuit state → open | "⚠️ [P2] {Provider} circuit breaker open. Fallback active." |
| Backup age > 25 hours | Backup check | "⚠️ [P2] Supabase backup is {N} hours old. Check backup settings." |

---

## P3 Alerts (Include in Daily Report)

| Condition | When Reported |
|-----------|--------------|
| Single API timeout (recovered) | Daily report |
| Schema validation failure (auto-recovered) | Daily report |
| Dedup rate > 50% in one run | Daily report |
| Non-critical cron missed | Daily report |
| Stale review tickets (> 48 hours, < 10 items) | Daily report |

P3 issues do NOT trigger immediate Telegram messages — they're included in the daily summary.

---

## Review Queue Alerts

| Queue Depth | Alert |
|------------|-------|
| > 20 items | Telegram: "Review queue has 20+ items. Consider reviewing soon." |
| > 50 items | P2 incident + Telegram alert, pause new outreach drafts |
| > 100 items | P1 incident, pause ALL new draft generation |

---

## Missed Run Detection

Hermes checks every 30 minutes for missed runs.
Expected completion times:
- `system_health_check`: 6:15 AM ET
- `daily_lead_workflow`: 8:00 AM ET
- `daily_marketing_workflow`: 9:00 AM ET
- `daily_remotion_content_workflow`: 11:00 AM ET

If not completed by expected time + 1 hour: P2 alert.

---

## Alert Format (Telegram)

```
[P1] 🚨 COLVIN CONTENT OS
[P2] ⚠️ COLVIN CONTENT OS
[P3 - in daily report only]

Issue: {description}
Agent/Stage: {agent} / {stage}
Run ID: {run_id_first_8}
Action Required: {specific action}
Time: {HH:MM ET}
```

---

## Alert Deduplication

Hermes does NOT spam alerts:
- Same alert type: max 1 per 10 minutes for P1, 1 per 30 minutes for P2
- Resolution alert sent when incident closes: "✅ Resolved: {issue}"
