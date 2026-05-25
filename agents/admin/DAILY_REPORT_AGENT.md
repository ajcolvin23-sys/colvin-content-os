# Daily Report Agent — Colvin Content OS

Generate Alfred's daily system briefing. Runs at 9 PM ET. Delivered via Telegram.

---

## Schedule

Daily at 9 PM ET: `0 21 * * *`

---

## Report Structure

```
📊 COLVIN CONTENT OS — DAILY BRIEF
[Date]

🏃 RUNS TODAY
  ✓ Gabriel daily run: Completed (15/15 stages)
  ✓ Health checks: All providers healthy
  ⚠️ Remotion MCP: Was offline for 45 min (9-9:45 AM) — recovered

📥 REVIEW QUEUE
  Pending approval: 12 items
  3 HIGH PRIORITY:
    1. [Indiana Backflow] 3 outreach drafts — score 8+
    2. [Music Theory] TikTok video blueprint — ready to render
    3. [First Keys Indy] Facebook post — HUD review needed
  
  To review: https://[your-dashboard-url]/dashboard/review

🎯 LEADS TODAY
  New leads found: 14
    - Indiana Backflow: 8 (3 score 7+)
    - Colvin Enterprises: 6 (4 score 7+)
  Total in outreach queue: 22

📝 CONTENT TODAY
  Drafts created: 9
    - TikTok scripts: 2
    - LinkedIn posts: 4
    - Facebook posts: 3
  Video blueprints: 1 (ready for review)

📤 OUTREACH SENT TODAY (After Alfred approval)
  [None — pending Alfred's approval of 7 drafts]

⚠️ ERRORS
  1 schema retry (auto-resolved)
  0 policy violations
  Recommendation: Firecrawl timeout rate increasing — reduce concurrency

🔝 TOP 3 ACTIONS FOR ALFRED
  1. Review Indiana Backflow outreach queue (3 high-score leads ready)
  2. Approve Music Theory TikTok video blueprint for render
  3. Review First Keys Indy Facebook post (HUD check needed)

---
Reply /help for commands | Dashboard: https://[url]/dashboard
```

---

## Delivery Method

Primary: Telegram message to Alfred's chat (TELEGRAM_CHAT_ID)
Secondary: Stored in Supabase `daily_reports` table for dashboard display

Long reports: Telegram sends summary (< 4,096 chars) + "Full report in dashboard"

---

## Top 3 Actions Logic

The Daily Report Agent ranks Alfred's required actions by:
1. Any P1/P2 unresolved incidents
2. Review items with `severity: block` compliance flags
3. High-fit leads (score 8+) with outreach ready
4. Video blueprints ready for render approval
5. Queue depth warnings

Always presents exactly 3 actions — the 3 highest-value things Alfred can do right now.

---

## Integration Status

IMPLEMENTED (partial): Telegram notifications active in automation-os/
PLANNED: Full structured daily report in Phase 5
