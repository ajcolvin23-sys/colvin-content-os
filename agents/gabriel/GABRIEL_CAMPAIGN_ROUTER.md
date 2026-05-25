# Gabriel Campaign Router — Colvin Content OS

The Campaign Router determines where each content request goes. Gabriel receives a campaign brief and routes to the right specialist agent.

---

## Routing Decision Tree

```
Incoming campaign request
  → What is the primary output needed?

  Video content
    → Gabriel Remotion Studio (ALWAYS — Remotion is the primary creative engine)
    → Sub-route to: Remotion Script Writer, Scene Planner, Asset Manifest

  Social media post (text + image)
    → Vibe Marketing Agent (trend research + angle)
    → Social Media Agent (platform-specific draft)
    → Caption and Hashtag Agent (finalize)

  Email campaign
    → Email Copy Agent (personalized draft)
    → Outbound Sequence Agent (if multi-touch)
    → Subject Line Testing (generate variants)

  Funnel or landing page
    → Funnel Builder Agent (strategy)
    → Landing Page Copy Agent (copy)
    → Lead Magnet Agent (if needs lead magnet)
    → Nurture Sequence Agent (follow-up emails)

  Lead generation
    → Lead Finder Agent (with lane playbook)
    → Lead Enrichment Agent
    → Lead Scoring
    → Back to Email Copy Agent for outreach

  Research brief
    → Research Agent (deep research + citation)
```

---

## Campaign State Tracking

Each campaign is tracked in the content calendar:

```json
{
  "campaign_id": "uuid",
  "lane": "music_theory_secrets",
  "name": "Gospel Piano Chord Secrets",
  "status": "active|paused|completed",
  "start_date": "2025-01-01",
  "end_date": "2025-01-31",
  "channels": ["tiktok", "youtube_shorts", "facebook"],
  "video_slots": 4,
  "videos_created": 1,
  "videos_approved": 0,
  "videos_rendered": 0,
  "posts_created": 8,
  "posts_approved": 3,
  "posts_published": 3
}
```

---

## Routing by Platform

| Platform | Primary Agent | Format |
|----------|--------------|--------|
| TikTok | Gabriel Remotion Studio | 9:16 video, 30-60s |
| YouTube Shorts | Gabriel Remotion Studio | 9:16 video, 30-60s |
| Instagram Reels | Gabriel Remotion Studio | 9:16 video |
| Facebook Reels | Gabriel Remotion Studio | 9:16 video |
| LinkedIn video | Gabriel Remotion Studio | 16:9 or 1:1 video |
| LinkedIn text/image | Social Media Agent | Text post |
| Instagram static | Social Media Agent | Image + caption |
| Facebook post | Social Media Agent | Text or text+image |
| Email | Email Copy Agent | Text email |
| YouTube long-form | Research Agent → Script Writer | Script only (not Remotion) |

---

## Campaign Slot Management

Gabriel tracks how many content pieces are "in flight" per campaign:
- If a campaign already has 2 video blueprints in the review queue: do not generate another until one is approved or rejected
- If a campaign has > 5 posts in the review queue: pause post generation for that campaign
- This prevents queue flooding from a single campaign

---

## Campaign Routing Conflicts

When two lanes want the same time slot:
- Priority order: first_keys_indy > colvin_enterprises > music_theory_secrets > funding_ready_indiana > others
- Time-sensitive content (grant deadline, event) always takes priority
- HUD/RESPA compliance review adds 1 business day buffer for First Keys Indy

---

## Integration Status

PLANNED — Campaign Router logic to be implemented in Phase 2-3.
Referenced by: GABRIEL_BUSINESS_EXECUTION_AGENT.md, DAILY_MARKETING_WORKFLOW.md
