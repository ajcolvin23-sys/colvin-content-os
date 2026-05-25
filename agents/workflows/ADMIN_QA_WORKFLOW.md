# Admin QA Workflow — Colvin Content OS

Full system health audit. Checks every automated system. Generates system health report. Creates GitHub issues for failures.

---

## Trigger

Daily cron: 9:30 AM ET (`30 9 * * *`) — after morning workflows complete
Also: Weekly deep audit (Sundays 2 AM via AUTOMATION_AUDIT_AGENT)

---

## Workflow Stages

```
Stage 1: Scheduled Automation Check
  Agent: Admin QA Agent
  Action: Did all scheduled workflows run today?
    - Check workflow_runs for: daily_lead_workflow, daily_marketing_workflow
    - Compare against expected completion time
  Output: Completion status per workflow

Stage 2: Failed Job Analysis
  Agent: Error Log Review Agent
  Action: Query workflow_runs WHERE status = 'failed' AND created_at > now() - interval '24h'
  Action: Categorize errors by class (transient/schema/policy/fatal)
  Output: Error summary

Stage 3: Missing Env Var Check
  Agent: System Health Check Agent
  Action: Attempt to load all required env vars
  Output: Missing var list (never log values)

Stage 4: Duplicate Lead Check
  Agent: CRM Hygiene Agent
  Action: Check for recent duplicate inserts (same idempotency key attempted twice)
  Output: Duplicate attempt count

Stage 5: Broken API Call Analysis
  Agent: Admin QA Agent
  Action: Check circuit breaker states
  Action: Check for API errors > 20% on any provider
  Output: Provider health summary

Stage 6: Incomplete Campaign Check
  Agent: Content Calendar Agent
  Action: Any campaigns with video_slots > videos_created for > 7 days?
  Output: Stalled campaign list

Stage 7: Failed Remotion Render Check
  Agent: Admin QA Agent
  Action: Check remotion blueprints WHERE render_status = 'failed'
  Output: Failed render list with error context

Stage 8: Pending Approval Check
  Agent: Human Review Gateway
  Action: Check review_tickets WHERE status = 'pending' AND created_at < now() - interval '48h'
  Output: Expired/stale review tickets

Stage 9: Backup Verification
  Agent: Backup Restore QA Agent
  Action: Verify Supabase last backup timestamp
  Output: Backup status

Stage 10: System Health Report Generation
  Agent: Daily Report Agent
  Action: Compile all checks into structured health report
  Output: Health report JSON

Stage 11: GitHub Issue Creation (for failures)
  Agent: Admin QA Agent
  Action: For each P3+ issue found: create GitHub issue (if GitHub integration exists)
  Output: Issue URLs logged to workflow_runs

Stage 12: Alfred Notification
  Agent: Hermes → Telegram
  Message: System health summary:
    "QA Complete: X/Y checks passed. Issues found: [list]. Full report in dashboard."
```

---

## Health Score

System receives a daily health score:
- 10/10: All checks passed
- 8-9/10: Minor issues (transient errors auto-recovered)
- 6-7/10: Attention needed (stalled campaigns, pending approvals)
- < 6/10: Immediate action required (P2 incident created)

---

## Integration Status

PLANNED — Phase 5.
