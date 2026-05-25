# Security Review Agent — Colvin Content OS

Weekly security scan. Check for exposed keys, compliance violations, improper data access, policy bypass attempts.

---

## Schedule

Every Monday at 3 AM ET: `0 3 * * 1`

---

## Security Checks

### 1. API Key Exposure Scan

Scan recent logs and workflow outputs for key-pattern strings:
- Pattern: `sk-` (OpenAI), `eyJ` (JWT), `postgres://` (Supabase URL with credentials)
- If detected: P1 incident immediately, do not wait for report

Scan locations:
- Last 7 days of workflow_runs `output_snapshot` fields
- Supabase error logs
- Any new review tickets or content records

### 2. Environment Variable Audit

Verify all required vars are set:
- Run synthetic test: attempt to load each required env var
- If any missing: P2 incident
- Verify no `NEXT_PUBLIC_*` vars contain secrets

### 3. Compliance Violation Check

Review last 7 days of published/approved content:
- Any First Keys Indy content: verify HUD compliance language present
- Any Girls Got Game content: verify youth-safe standards maintained
- Any email sent: verify unsubscribe mechanism was included
- Any income claim: verify FTC disclosure language present

### 4. Scraping Policy Review

Review Firecrawl activity for last 7 days:
- Any domain scraped that shows `robots_txt_checked: false`
- Any domain scraped > 50 pages in one run
- Any unauthorized domain (gated content, LinkedIn at scale)

### 5. Lead Data Integrity

Review leads created in last 7 days:
- All leads have `provenance.source_url` (not null)
- All leads have `provenance.is_public_data: true`
- No leads with `do_not_contact` status have new outreach drafts
- No contacts in the 30-day window have been re-contacted

### 6. Access Control Check

- Verify Supabase RLS policies are still active on all tables
- Verify `SUPABASE_SERVICE_ROLE_KEY` is only used server-side
- Check for any new NEXT_PUBLIC_ env vars that shouldn't be public

### 7. Third-Party Integrations

- Verify Telegram bot is only accessible from authorized chat IDs
- Verify CRON_SECRET header is required on all cron endpoints
- Verify Remotion MCP endpoint is not publicly accessible

---

## Security Report Output

```markdown
## Weekly Security Report — [Date]

### Status: ✓ PASS | ⚠️ REVIEW REQUIRED | 🚨 ACTION REQUIRED

### API Key Scan: [PASS/FAIL]
### Env Var Audit: [PASS/FAIL]
### Compliance Check: [PASS/FAIL]
  - First Keys Indy: [items checked, issues found]
  - Girls Got Game: [items checked, issues found]
### Scraping Policy: [PASS/FAIL]
### Lead Data Integrity: [PASS/FAIL]
### Access Control: [PASS/FAIL]
### Third-Party Integrations: [PASS/FAIL]

### Issues Found
1. [Issue] — [Severity] — [Recommended Action]

### No action required items: [count]
```

Report delivered to Alfred via Telegram (summary) and stored in Supabase.

---

## Integration Status

PLANNED — Phase 5. Depends on: All agents being operational, Supabase logs accessible.
