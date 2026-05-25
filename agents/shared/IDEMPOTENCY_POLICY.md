# Idempotency Policy — Colvin Content OS

Idempotency keys prevent duplicate sends, duplicate renders, duplicate lead inserts, and duplicate workflow executions.

---

## Key Format

```
{lane}_{action}_{target_identifier}_{date}
```

### Examples by Context

| Context | Example Key |
|---------|------------|
| Lead insert | `indiana_backflow_directory_lead_acme_plumbing_indianapolis_2025-01-15` |
| Outreach draft | `colvin_enterprises_outreach_abc12345_linkedin_connection_1_2025-01-15` |
| Email draft | `music_theory_secrets_email_abc12345_sequence_1_2025-01-15` |
| Video blueprint | `music_theory_secrets_video_piano_lessons_tiktok_2025-01-15` |
| Workflow run stage | `daily_lead_workflow_lead_scoring_run_abc123_2025-01-15` |
| Content item | `colvin_enterprises_content_linkedin_post_ai_automation_2025-01-15` |

### Rules
- Date must be `YYYY-MM-DD` format
- All parts lowercase, underscores only
- Target identifier: use slug form of company name, lead ID prefix (8 chars), or content slug
- Maximum length: 200 characters

---

## How Idempotency Keys Are Checked

Before inserting any record into Supabase:
1. Generate idempotency key for the operation
2. Query Supabase for existing record with that key
3. If found: log as dedup skip, return existing record — do NOT re-insert
4. If not found: insert with key, continue

```typescript
// Pseudocode pattern
const key = buildIdempotencyKey(lane, action, target, date);
const existing = await supabase
  .from('leads')
  .select('id')
  .eq('idempotency_key', key)
  .single();

if (existing.data) {
  logger.info({ key }, 'Idempotency: duplicate skipped');
  return existing.data;
}
// proceed with insert
```

---

## 30-Day Contact Window

For outreach specifically:
- After any contact attempt, set `contact_window_expires_at = now() + 30 days`
- Before generating any new outreach for a lead, check this field
- If `contact_window_expires_at > now()`: skip this lead, log reason
- The idempotency key for outreach includes the sequence step number so step 2 can still be inserted after step 1

---

## Idempotency for Remotion Renders

- Each video blueprint gets a unique `video_id` (UUID)
- Each render trigger uses `video_id` as the idempotency key for the render job
- If render job already exists for that `video_id`: check status
  - `draft` or `failed`: re-trigger is allowed
  - `rendering` or `rendered`: do NOT re-trigger

---

## Idempotency for Workflow Stages

- Each stage execution creates a `workflow_runs` record with `idempotency_key`
- Key format: `{workflow_name}_{stage}_{run_id_first_8_chars}`
- If replaying a stage after failure: use same key (update record, don't insert new)
- This ensures the replay log traces back to the original run

---

## Deduplication Reporting

Daily: `CRM_HYGIENE_AGENT` reports:
- Number of dedup skips in last 24 hours per lane
- Any suspicious dedup patterns (same lead trying to insert many times = scraper issue)

This data surfaces in `DAILY_REPORT_AGENT` output.
