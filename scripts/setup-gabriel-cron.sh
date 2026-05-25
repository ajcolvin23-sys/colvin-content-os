#!/bin/bash
# Sets up a local macOS cron to run Gabriel daily at 7:00 AM CST (8 AM EST)
# Run once: bash scripts/setup-gabriel-cron.sh

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="$PROJECT_DIR/logs"
RUN_SCRIPT="$PROJECT_DIR/scripts/run-gabriel-daily.sh"

mkdir -p "$LOG_DIR"

cat > "$RUN_SCRIPT" << 'RUNSCRIPT'
#!/bin/bash
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_FILE="$PROJECT_DIR/logs/gabriel-$(date '+%Y-%m-%d').log"

echo "=== Gabriel Daily Run: $(date) ===" >> "$LOG_FILE" 2>&1

if [ -f "$PROJECT_DIR/.env.local" ]; then
  export $(grep -v '^#' "$PROJECT_DIR/.env.local" | grep '=' | xargs)
fi

cd "$PROJECT_DIR"
npm run gabriel:daily >> "$LOG_FILE" 2>&1
echo "[$(date)] Done. Exit code: $?" >> "$LOG_FILE"
RUNSCRIPT

chmod +x "$RUN_SCRIPT"
echo "Created: $RUN_SCRIPT"

CRON_LINE="0 7 * * * $RUN_SCRIPT"
CURRENT_CRON=$(crontab -l 2>/dev/null || echo "")

if echo "$CURRENT_CRON" | grep -q "run-gabriel-daily"; then
  echo "Gabriel cron already exists. No changes made."
else
  (echo "$CURRENT_CRON"; echo ""; echo "# Gabriel Daily Run — 7:00 AM"; echo "$CRON_LINE") | crontab -
  echo "Crontab updated."
fi

echo ""
echo "Gabriel will run every day at 7:00 AM (Mac local time)"
echo "Logs: $LOG_DIR/gabriel-YYYY-MM-DD.log"
echo ""
echo "Test now: bash $RUN_SCRIPT"
