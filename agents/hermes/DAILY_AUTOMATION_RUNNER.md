# Daily Automation Runner — Colvin Content OS

Hermes manages all daily automation runs including scheduling, missed-run detection, and run history.

---

## Cron Schedule (All times ET)

| Cron Expression | Workflow | Description |
|----------------|---------|-------------|
| `0 6 * * *` | System health check | Pre-flight before Gabriel runs |
| `0 7 * * *` | DAILY_LEAD_WORKFLOW | Lead generation for all active lanes |
| `0 8 * * *` | DAILY_MARKETING_WORKFLOW | Content creation and calendar update |
| `0 9 * * 1` | WEEKLY_OPTIMIZATION_WORKFLOW | Monday morning self-audit |
| `0 10 * * *` | DAILY_REMOTION_CONTENT_WORKFLOW | Video blueprint generation (if approved campaigns exist) |
| `*/30 * * * *` | SYSTEM_HEALTH_CHECK | Health ping every 30 min |
| `0 20 * * *` | Gabriel run completion check | Verify all daily runs completed |
| `0 21 * * *` | DAILY_REPORT_AGENT | Compile and send daily briefing to Alfred |
| `0 2 * * 0` | AUTOMATION_AUDIT_AGENT | Weekly audit Sunday 2 AM |
| `0 3 * * 1` | SECURITY_REVIEW_AGENT | Security scan Monday 3 AM |
| `0 4 * * *` | CRM_HYGIENE_AGENT | Daily dedup + archive stale leads |
| `0 5 * * *` | BACKUP_RESTORE_QA | Verify Supabase backups |

Cron is managed via Next.js API routes protected by `CRON_SECRET` header, triggered by Vercel Cron.

---

## Gabriel Daily Run Sequence

The 15-step Gabriel daily run (from automation-os/) maps to this orchestration:

1. Pre-flight health check
2. Load gabriel-config.json
3. Determine active lanes for today
4. Run Lead Finder for each active lane
5. Enrich and score new leads
6. Dedup new leads against existing CRM
7. Generate outreach drafts for qualified leads (score 7+)
8. Research trending content topics per lane
9. Generate social media posts per lane
10. Generate Remotion video brief if campaign slot open
11. Check for approved video blueprints → trigger renders
12. Check review queue depth → alert Alfred if > 20 items
13. Run compliance scan on all generated items
14. Post all items to review queue
15. Send Telegram summary to Alfred

---

## Missed Run Detection

On every 30-minute health check, Hermes:
1. Queries workflow_runs for each expected daily workflow
2. Checks: was this workflow run today?
3. If not run by its expected time + 1 hour: missed run detected

Missed run response:
- Run missed < 2 hours late: attempt immediate replay
- Run missed > 2 hours late: create P2 incident, alert Alfred, do not auto-replay
- Run missed 2+ consecutive days: create P1 incident, escalate

---

## Run History

All run history stored in Supabase `workflow_runs` table:
- Queryable by: `workflow_name`, `run_id`, `status`, `lane`, `created_at`
- Retention: 90 days
- Daily summary rows: one summary row per workflow per day for dashboard

---

## Run Status Tracking

| Status | Meaning |
|--------|---------|
| pending | Scheduled, not yet started |
| running | Currently executing |
| completed | All stages successful |
| failed | One or more stages failed, not recovered |
| blocked | Waiting for human approval |
| replaying | Stage replay in progress |
| skipped | Conditions not met (e.g., no new leads) |

---

## Manual Run Trigger

Alfred can trigger any workflow manually via:
- Telegram bot command (configured in automation-os/)
- Dashboard `/run` endpoint (POST with CRON_SECRET)
- CLI: `npm run workflow:daily-leads`

Manual runs create a new `run_id` with `source: 'manual'` in provenance.

---

## Run Configuration

Active lane configuration loaded from `automation-os/config/gabriel-config.json`.
Each lane can be:
- `active: true` — runs daily
- `active: false` — skipped
- `active: "weekly"` — runs on specified day only

Integration Status: IMPLEMENTED (automation-os/config/gabriel-config.json exists and drives runs)
