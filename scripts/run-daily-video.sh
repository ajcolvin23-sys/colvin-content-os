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
