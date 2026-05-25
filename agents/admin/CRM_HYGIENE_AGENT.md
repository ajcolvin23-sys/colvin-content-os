# CRM Hygiene Agent — Colvin Content OS

Clean the CRM. Deduplicate leads. Archive stale leads. Update statuses. Flag missing contact info.

---

## Schedule

Daily at 4 AM ET: `0 4 * * *`

---

## Hygiene Operations

### 1. Deduplication

Find and merge duplicate lead records:
```sql
-- Find potential duplicates by email
SELECT email, COUNT(*) as count, array_agg(id) as ids
FROM leads
WHERE email IS NOT NULL AND status != 'do_not_contact'
GROUP BY email
HAVING COUNT(*) > 1;

-- Find potential duplicates by company+name
SELECT lower(trim(regexp_replace(company, '(Inc\.|LLC|Ltd\.|Co\.).*', '', 'i'))) as co,
       lower(trim(name)) as nm, COUNT(*), array_agg(id)
FROM leads
WHERE status != 'do_not_contact'
GROUP BY 1, 2 HAVING COUNT(*) > 1;
```

Merge rules (see LEAD_DEDUPLICATION_RULES.md):
- Keep record with most complete data
- Keep oldest `created_at`
- Keep most conservative `contact_window_expires_at`

### 2. Stale Lead Archiving

Archive leads that have not advanced in > 60 days:
```sql
UPDATE leads 
SET status = 'archived'
WHERE status IN ('raw', 'scored')
  AND updated_at < now() - interval '60 days';
```

Archive contacts in `status: enriched` with `qualification_score < 5` that are > 90 days old.

### 3. Contact Window Reset

Find leads where `contact_window_expires_at` has passed and status is `contacted`:
- If lead never responded: advance to next sequence step or archive
- If lead expired: reset status to `scored` for re-evaluation

### 4. Missing Data Flagging

Identify leads in outreach queue missing critical data:
```sql
SELECT id, name, company, lane
FROM leads
WHERE status = 'in_outreach_queue'
  AND (email IS NULL AND linkedin_url IS NULL);
```

These leads have no contact channel — flag for enrichment or archive.

### 5. Do-Not-Contact PII Purge

```sql
UPDATE leads 
SET email = NULL, 
    phone = NULL, 
    linkedin_url = NULL,
    name = 'REDACTED'
WHERE status = 'do_not_contact'
  AND (email IS NOT NULL OR phone IS NOT NULL OR linkedin_url IS NOT NULL);
```

Keep: company, lane, idempotency_key, do_not_contact status (to prevent re-adding).

---

## Hygiene Report

Daily hygiene summary in daily report:
```
CRM Hygiene (4 AM run):
  Duplicates merged: 2
  Stale leads archived: 7
  Contact windows reset: 3
  Missing contact channel flagged: 1
  PII purged (do_not_contact): 0
  Total active leads: 247
```

---

## Manual Triggers

Alfred can trigger a hygiene run manually via:
- Dashboard: Admin > Run CRM Hygiene
- CLI: `npm run crm:hygiene`

---

## Integration Status

PLANNED — Phase 5. Depends on: Supabase leads table with all required fields.
