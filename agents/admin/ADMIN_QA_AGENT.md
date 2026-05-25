# Admin QA Agent — Colvin Content OS

Audit all automations. Check that the system is working as expected. Create GitHub issues for failures.

---

## Daily QA Checks

Run daily at 9:30 AM ET (after all morning workflows complete):

### Automation Run Verification
- [ ] Gabriel daily run: Did it complete today? (check workflow_runs)
- [ ] Lead generation: Were leads found and scored?
- [ ] Content generation: Were drafts created?
- [ ] Review queue: Are items pending for Alfred?
- [ ] Health checks: Did system health pass?

### Data Quality Checks
- [ ] New leads have valid provenance (source_url present)
- [ ] New leads have qualification_score assigned
- [ ] No lead records missing required fields
- [ ] Dedup ratio is normal (< 40% skip rate)
- [ ] Confidence scores are > 0.5 for all new records

### Output Quality Checks
- [ ] Generated content has no `severity: block` compliance flags that were ignored
- [ ] Remotion blueprints are schema-valid
- [ ] Email drafts have subject lines and unsubscribe language
- [ ] All review tickets have context populated

### API and Integration Health
- [ ] No failed Supabase writes in last 24 hours
- [ ] OpenAI call success rate > 90%
- [ ] Firecrawl scraping success rate > 80%
- [ ] No Remotion render stuck > 30 minutes
- [ ] Telegram bot responded to all health pings

---

## Weekly QA Additions

Run Monday mornings:
- [ ] Review last 7 days of workflow_runs for patterns
- [ ] Check incident table: any unresolved P2/P3?
- [ ] Review queue: avg time to Alfred's review (should be < 48 hours)
- [ ] Lead pipeline health: total leads by status per lane
- [ ] Remotion renders: how many drafted vs approved vs rendered this week?
- [ ] CRM hygiene check: any stale leads to archive?

---

## Issue Creation

When a check fails:
1. Log as P3 incident (most admin issues are P3)
2. Generate GitHub issue (if available) or create task note in Supabase
3. Include in daily report for Alfred

Issue format:
```
Title: [Admin QA] {Check name} failed - {date}
Body:
  Check: {what was checked}
  Expected: {expected result}
  Actual: {what was found}
  Run ID: {run_id}
  Recommended Fix: {steps to resolve}
  Priority: P3
```

---

## QA Report Output

Daily QA report included in DAILY_REPORT_AGENT output:
- Summary: X/Y checks passed
- Failed checks: list with recommended fixes
- Highlights: any new records of note (high-score leads, approved videos)

---

## Integration Status

PLANNED — Phase 5. Works with: SYSTEM_HEALTH_CHECK_AGENT, DAILY_REPORT_AGENT, all workflow agents.
