#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# scripts/setup-local-cron.sh
#
# Sets up a local macOS crontab to run the daily video pipeline every day at:
#   5:00am EST Mon-Fri  → optimal for TikTok morning post (7-9am)
#   9:00am EST Sat-Sun  → optimal weekend engagement window
#
# Run once: bash scripts/setup-local-cron.sh
# ─────────────────────────────────────────────────────────────────────────────

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="$PROJECT_DIR/logs"
SCRIPT="$PROJECT_DIR/scripts/run-daily-video.sh"

# Create logs directory
mkdir -p "$LOG_DIR"

# Create the run script that sources env and runs the pipeline
cat > "$SCRIPT" << 'RUNSCRIPT'
#!/bin/bash
set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_FILE="$PROJECT_DIR/logs/daily-video-$(date '+%Y-%m-%d').log"

echo "=== Daily Video Run: $(date) ===" >> "$LOG_FILE" 2>&1

# Load env vars from .env.local
if [ -f "$PROJECT_DIR/.env.local" ]; then
  export $(grep -v '^#' "$PROJECT_DIR/.env.local" | grep '=' | xargs)
fi

# Step 1: Trigger content generation via Vercel API
echo "[$(date)] Triggering content generation..." >> "$LOG_FILE"
curl -s -X POST \
  "${NEXT_PUBLIC_APP_URL}/api/daily-video" \
  -H "Authorization: Bearer ${CRON_SECRET}" \
  -H "Content-Type: application/json" >> "$LOG_FILE" 2>&1

echo "" >> "$LOG_FILE"
echo "[$(date)] Waiting 30s for content to be saved..." >> "$LOG_FILE"
sleep 30

# Step 2: Render + upload + notify
echo "[$(date)] Starting render pipeline..." >> "$LOG_FILE"
cd "$PROJECT_DIR"
npx ts-node --project remotion/tsconfig.json scripts/render-daily.ts >> "$LOG_FILE" 2>&1

echo "[$(date)] Done." >> "$LOG_FILE"
RUNSCRIPT

chmod +x "$SCRIPT"

echo "Created run script: $SCRIPT"

# Add crontab entries
# 5am EST = 10:00 UTC, but crontab uses local time
# Assuming Mac is set to EST/EDT

CRON_ENTRY_WEEKDAY="0 5 * * 1-5 $SCRIPT"
CRON_ENTRY_WEEKEND="0 9 * * 0,6 $SCRIPT"

# Check if entries already exist
CURRENT_CRON=$(crontab -l 2>/dev/null || echo "")

if echo "$CURRENT_CRON" | grep -q "run-daily-video"; then
  echo "Crontab entries already exist. No changes made."
else
  # Add new entries
  (echo "$CURRENT_CRON"; echo ""; echo "# First Keys Indy Daily Video — added $(date)"; echo "$CRON_ENTRY_WEEKDAY"; echo "$CRON_ENTRY_WEEKEND") | crontab -
  echo "Crontab updated successfully."
  echo ""
  echo "Schedule:"
  echo "  Mon-Fri: 5:00am — renders + uploads + notifies you on Telegram"
  echo "  Sat-Sun: 9:00am — renders + uploads + notifies you on Telegram"
fi

echo ""
echo "To test right now, run:"
echo "  bash $SCRIPT"
echo ""
echo "Logs will be in: $LOG_DIR/"
