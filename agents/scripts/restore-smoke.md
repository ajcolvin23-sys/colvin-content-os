# Restore Smoke Test — Colvin Content OS

Safe test procedure to verify backup restore is possible without overwriting production.

---

## IMPORTANT SAFETY NOTE

This procedure tests that a restore is POSSIBLE. It does NOT restore to production.
Never restore over production without Alfred's explicit decision.

---

## When to Run This

- Monthly readiness check (first Sunday of each month)
- After a major database schema change
- After upgrading Supabase plan
- Before any risky schema migration

---

## Smoke Test Procedure

### Method 1: Supabase Dashboard Verification

1. Log in to supabase.com → project `iuzlbtfevzkerehmluqj`
2. Navigate to: Database → Backups
3. Verify the "Restore" button is visible for the latest backup
4. DO NOT click Restore — just verify it's available
5. Note the backup timestamp in the verification log

### Method 2: Point-in-Time Recovery Verification (Pro plan)

1. Supabase dashboard → Database → Backups → Point in Time Recovery
2. Verify the timeline shows coverage for the last 24 hours
3. Identify a safe test restoration point (e.g., 2 hours ago)
4. Note: Do NOT execute a restore to production
5. Document: PITR is available, timestamp range confirmed

### Method 3: Test Schema Restore (If Safe Environment Available)

If a separate test Supabase project exists:
1. From production project: Database → Backups → Download latest
2. Restore to test project: Test project → Database → Restore from file
3. Verify record counts match expected values:
   ```sql
   SELECT COUNT(*) FROM leads; -- Should match production count
   SELECT COUNT(*) FROM workflow_runs; -- Should be > 0
   ```
4. Verify schema is intact:
   ```sql
   SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
   ```
5. Document successful restore with timestamp

---

## Restore Readiness Checklist

```
Monthly Restore Readiness Check:
[ ] Supabase plan confirmed: includes backups
[ ] Latest backup timestamp: _____ (< 25 hours ago)
[ ] Restore button verified available in dashboard
[ ] Database URL documented in secure location (NOT in code)
[ ] Alfred knows how to initiate a restore
[ ] Estimated restore time: ___ minutes (from Supabase docs)

Status: READY / NOT READY
Checked by: Alfred Colvin
Date: _____
```

---

## Emergency Restore Procedure (If Data Loss Occurs)

1. Do NOT make any more writes to the database
2. Log in to Supabase dashboard immediately
3. Database → Backups → Select last known good backup
4. Click Restore (this will overwrite current data with backup)
5. Confirm you understand the implications
6. Wait for restore to complete (may take several minutes)
7. Verify data integrity after restore
8. Create P1 incident documenting what happened

---

## Integration Status

PLANNED — Documentation complete. Script wrapper in Phase 5.
