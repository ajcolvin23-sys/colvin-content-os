# Lead Deduplication Rules — Colvin Content OS

Prevent the same lead from being contacted more than once in 30 days and prevent duplicate records in the CRM.

---

## Deduplication Keys (Priority Order)

A lead is a duplicate if any ONE of the following matches an existing record:

1. **linkedin_url** — exact match (normalized: lowercase, trailing slash removed)
2. **email** — exact match (lowercase, trimmed)
3. **company_slug + name_slug** — fuzzy match: company name normalized + person name normalized

**Normalization rules:**
- Lowercase
- Remove: `Inc.`, `LLC`, `Ltd.`, `Co.`, etc.
- Remove: `www.`, trailing slashes from URLs
- Trim whitespace
- Remove punctuation

---

## 30-Day Contact Window

Before generating outreach for any lead:
1. Check `contact_window_expires_at` field
2. If `contact_window_expires_at > now()`: skip — too soon to re-contact
3. If null or `< now()`: can proceed

On any contact attempt:
1. Set `last_contacted_at = now()`
2. Set `contact_window_expires_at = now() + 30 days`

---

## Idempotency Keys for Lead Inserts

Every lead insert uses an idempotency key to prevent duplicate inserts:

```
Format: {lane}_lead_{company_slug}_{city_slug}_{date}
Example: indiana_backflow_directory_lead_smith_plumbing_indianapolis_2025-01-15
```

Before any insert:
1. Generate idempotency key
2. Query Supabase: `SELECT id FROM leads WHERE idempotency_key = ?`
3. If found: return existing record, do NOT insert
4. If not found: insert with key

---

## Same-Lead, Different Lane

A contact can appear in multiple lanes if they're legitimately a fit for more than one:
- Allowed: same person as a music lead AND a colvin_enterprises lead
- Each lane tracks its own contact window
- Outreach from different lanes must not be sent on the same day to the same contact
- Max 1 outreach per week per contact regardless of lane

---

## Dedup for Outreach

Before generating outreach for a lead:
1. Check `status` field — if `do_not_contact`: never generate outreach
2. Check `contact_window_expires_at` — if not expired: skip
3. Check `outreach` table for existing drafts with same `lead_id` — if pending approval: do not generate another

---

## Dedup Reporting

Daily: CRM Hygiene Agent reports dedup metrics:
- Dedup skip count by lane
- Duplicate insert attempt rate
- Most common dedup pattern (by key field)

This surfaces anomalies (e.g., 100 dedup skips suggests scraper is hitting same sources repeatedly).

---

## Merge Rules

When two records are identified as duplicates after insertion:
1. Keep the record with more complete data
2. Merge any unique fields from the lower-quality record
3. Keep the oldest `created_at`
4. Keep the lowest (most conservative) `contact_window_expires_at`
5. Log the merge in workflow_runs
6. Alfred can review merged records via CRM dashboard

---

## do_not_contact Records

Records with `status: do_not_contact`:
- Retain the record (for compliance — to prevent re-adding the same contact)
- Purge PII fields: email, phone, linkedin_url, name (replace with hashed values)
- Keep: company, lane, do_not_contact flag, idempotency_key
- Never generate outreach for these records under any circumstances
