# Content Calendar Agent — Colvin Content OS

Build, maintain, and optimize weekly/monthly content calendars per lane. Track what's been posted, find gaps, suggest optimal timing.

---

## Calendar Structure

Each lane has its own content calendar. The calendar tracks:

```json
{
  "lane": "music_theory_secrets",
  "week_of": "2025-01-13",
  "slots": [
    {
      "date": "2025-01-14",
      "platform": "tiktok",
      "status": "published",
      "content_id": "uuid",
      "topic": "Gospel chord #1: the flat 7",
      "published_at": "2025-01-14T14:00:00Z"
    },
    {
      "date": "2025-01-16",
      "platform": "facebook",
      "status": "approved",
      "content_id": "uuid",
      "topic": "Why gospel piano sounds different from classical",
      "scheduled_for": "2025-01-16T11:00:00Z"
    },
    {
      "date": "2025-01-17",
      "platform": "youtube_shorts",
      "status": "draft",
      "content_id": "uuid",
      "topic": "Step-by-step gospel chord walkthrough"
    }
  ]
}
```

---

## Optimal Posting Times by Platform and Lane

| Platform | Best Time | Notes |
|----------|----------|-------|
| TikTok | Tue/Thu/Fri 7-9 PM ET | Gospel music: Thu/Fri ahead of Sunday worship |
| YouTube Shorts | Sat/Sun 10 AM–2 PM ET | Weekend discovery |
| Instagram | Wed/Fri 11 AM or 7 PM ET | — |
| Facebook | Music lane: Thu 11 AM, First Keys Indy: Mon/Wed | Marion County audience peaks |
| LinkedIn | Tue/Wed/Thu 8-10 AM ET | B2B working hours |

---

## Gap Detection

Content Calendar Agent identifies gaps weekly:
- Platforms with no content this week
- Lanes that have gone > 7 days without a post
- Campaigns with approved content but no published items
- Video blueprints approved but not rendered

Gap report included in DAILY_REPORT_AGENT output.

---

## Content Rotation Rules

- Same topic: do not repeat within 14 days on the same platform for the same lane
- Similar hook format: rotate at least 3 different hook formulas per week
- CTA rotation: alternate CTAs (don't use the same CTA every post)

---

## Calendar Build Process

Weekly on Mondays (from WEEKLY_OPTIMIZATION_WORKFLOW):
1. Review last week's published content
2. Identify what performed (Alfred feedback + manual engagement review)
3. Plan this week's slots for each active lane
4. Pre-fill with pending approved content
5. Identify gaps requiring new content generation
6. Present draft calendar to Alfred via Telegram

---

## Integration Status

PLANNED — Phase 3. Stored in Supabase `content_calendar` table.
