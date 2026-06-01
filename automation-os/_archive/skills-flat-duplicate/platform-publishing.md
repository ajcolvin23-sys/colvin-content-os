# Skill: Platform Publishing

## Status by Platform

| Platform | Status | Can Gabriel Draft? | Can Gabriel Post? |
|---|---|---|---|
| LinkedIn | Active | YES | NO — Alfred posts manually |
| Instagram | Active | YES | NO — Alfred posts via Meta BS |
| Facebook | Active | YES | NO — Alfred posts via Meta BS |
| TikTok | Configured | YES | NO — OAuth not completed |
| YouTube | Configured | YES (scripts) | NO — Alfred uploads manually |
| Email | Not yet live | YES | NO — platform not selected |
| Telegram | Active (internal) | N/A | YES (daily brief only) |

## Publishing Workflow

```
Gabriel drafts → Alfred reviews → Alfred approves → Alfred posts
```

No step of this workflow is skipped. No automation posts on Alfred's behalf.

## LinkedIn Publishing Guide

Alfred posts from LinkedIn.com or LinkedIn mobile app:
1. Go to review queue in Content OS dashboard
2. Copy approved post
3. Paste into LinkedIn, add media if needed
4. Post at optimal times: 7:30am, 12pm, or 5pm CST

**Optimal content mix (per week):**
- 2–3 educational posts (teach something)
- 1 personal story or observation
- 1 CTA post (offer, booking link, question)

## Instagram / Facebook Publishing Guide

Alfred uses Meta Business Suite (business.facebook.com):
1. Copy approved caption from Content OS dashboard
2. Add 3–5 hashtags (included in draft)
3. Attach media (photo or video)
4. Schedule or post immediately

## Content Formatting Rules

**LinkedIn:** No more than 5 hashtags. Line breaks between paragraphs. Emojis optional (1–2 max).

**Instagram:** 3–5 hashtags. Shorter captions perform better. First line must hook.

**Facebook:** Longer posts OK for community-building lanes. Keep promotional posts short.

**TikTok/Reels:** Hook in first frame. Text overlay key points. Trending audio when relevant.

## Future: OAuth Integration

When Alfred completes OAuth for TikTok and YouTube:
- Update `platforms.json` with token info
- Gabriel can then generate upload-ready packages (video + title + description + tags)
- Alfred still approves before upload — no auto-upload
