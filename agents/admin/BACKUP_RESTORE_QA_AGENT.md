# Backup Restore QA Agent — Colvin Content OS

Verify Supabase backups exist. Test restore smoke test. Confirm data integrity. Alert if backup missing.

---

## Schedule

Daily at 5 AM ET: `0 5 * * *`

---

## What This Protects

Supabase database contains Alfred's critical data:
- All lead records (CRM)
- All workflow run history
- All review tickets
- All content drafts
- All incident records
- All generated Remotion video blueprints

Loss of this data would be significant — backup verification is non-optional.

---

## Supabase Backup Configuration

Supabase project: iuzlbtfevzkerehmluqj

Backup types:
1. **Automated daily backups** (Supabase handles, on paid plan)
2. **Point-in-time recovery** (Supabase Pro plan)
3. **Manual exports** (CSV or pg_dump via Supabase dashboard)

**Verify backup plan tier:**
Alfred should confirm which Supabase plan is active and whether daily backups are enabled.

---

## Daily Backup Verification

```
1. Query Supabase management API or check backup status
2. Verify last backup timestamp is < 25 hours ago
3. Verify backup size is reasonable (not suspiciously small)
4. Log result to system_health table
```

If backup age > 25 hours: P2 incident, alert Alfred.
If backup not configured: P1 incident, alert immediately.

---

## Weekly Restore Smoke Test

Every Sunday: verify backup restore procedure is documented and tested.

**Smoke test procedure (safe — does not overwrite production):**
1. Use Supabase Point-in-Time Recovery to identify restore point
2. Verify the restore UI is accessible
3. Confirm Alfred knows the procedure (documented in restore-smoke.md)
4. Do NOT perform actual restore unless disaster recovery is needed

The smoke test is a readiness check, not an actual restore operation.

---

## Data Integrity Check

Daily: verify critical table record counts haven't dropped unexpectedly:
```sql
SELECT 
  'leads' as table_name, COUNT(*) as record_count 
FROM leads
UNION ALL
SELECT 'workflow_runs', COUNT(*) FROM workflow_runs WHERE created_at > now() - interval '7 days'
UNION ALL
SELECT 'review_tickets', COUNT(*) FROM review_tickets;
```

If count drops > 20% day-over-day without a CRM hygiene run: alert Alfred (possible data issue).

---

## Backup Alert

P2 incident triggers for:
- Last backup > 25 hours ago
- Backup not enabled
- Record count drop > 20% (unexplained)

Telegram alert format:
```
⚠️ [P2] Backup Alert
Supabase project: iuzlbtfevzkerehmluqj
Issue: Last backup is 32 hours old (threshold: 25 hours)
Action: Check Supabase dashboard > Database > Backups
```

---

## Integration Status

PLANNED — Phase 5. Requires: Supabase plan verification, backup API access.
Note: Alfred should verify backup is enabled for project iuzlbtfevzkerehmluqj at supabase.com.
