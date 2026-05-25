# Backup Verification — Colvin Content OS

How to verify Supabase backups are configured and current.

---

## npm Command

```bash
npm run backup:verify
```

---

## Manual Verification Steps

### Step 1: Check Supabase Plan

1. Log in to supabase.com
2. Navigate to project `iuzlbtfevzkerehmluqj`
3. Go to: Settings → Billing
4. Confirm plan supports daily backups (Pro plan or higher)
5. Note: Free plan does NOT include automated backups

### Step 2: Check Backup Status

1. In Supabase dashboard: Database → Backups
2. Look for:
   - Last backup timestamp
   - Backup size
   - Backup status (Success / Failed)
3. Verify last backup is < 25 hours ago

### Step 3: Verify Via Script

```bash
npm run backup:verify
```

Expected output:
```
Supabase Backup Verification
============================
Project: iuzlbtfevzkerehmluqj

Backup Status: ✓ CURRENT
Last backup: 6.2 hours ago (2025-01-15 03:00:00 UTC)
Backup size: 24.3 MB
Next expected backup: ~17.8 hours from now

Table record counts:
  leads: 247 records
  workflow_runs: 1,843 records (last 90 days)
  review_tickets: 89 records
  incidents: 12 records

Status: OK
```

---

## What to Do If Backup Is Missing

1. Check if Supabase plan includes backups (Free tier = no backups)
2. Upgrade to Pro plan if needed
3. Consider manual exports as interim solution:
   ```bash
   # Manual backup export (from Supabase dashboard)
   # Database → Backups → Download latest backup
   ```
4. Create P2 incident in Supabase
5. Alert Alfred via Telegram

---

## Manual Export (Emergency)

If automated backups are not set up, perform manual backup:

```bash
# Download from Supabase dashboard: Database → Backups → Logical backup
# Or use pg_dump if direct database access is configured:

pg_dump "$DATABASE_URL" \
  --format=custom \
  --file="backup-$(date +%Y%m%d-%H%M).dump"
```

---

## Integration Status

PLANNED — Backup monitoring script in Phase 5.
Note: Alfred should verify supabase.com backup settings for project iuzlbtfevzkerehmluqj before Phase 1 launch.
