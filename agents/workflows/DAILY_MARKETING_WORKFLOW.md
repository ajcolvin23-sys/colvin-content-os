# Daily Marketing Workflow — Colvin Content OS

Research trends, generate content across all platforms, generate Remotion video briefs, and load review queue.

---

## Trigger

Daily cron: 8 AM ET (`0 8 * * *`)

---

## Workflow Stages

```
Stage 1: Pre-flight
  Agent: Hermes
  Action: Load gabriel-config.json, check content calendar, identify open slots per lane
  Output: Content plan for today — which lanes need content, which platforms, which themes

Stage 2: Trend Research (per active lane)
  Agent: Vibe Marketing Agent → Research Agent via Firecrawl
  Action: What's trending in each niche this week?
  Output: Trend brief per lane (3-5 trending topics with hook potential)

Stage 3: Campaign Angle Generation
  Agent: Campaign Angle Agent
  Input: Trend briefs per lane
  Action: Generate 2-3 campaign angle options per lane
  Output: Scored angle options per lane

Stage 4: Content Calendar Check
  Agent: Content Calendar Agent
  Action: Which platforms have open slots this week? What's already approved?
  Output: Content slots needing new content + what to skip

Stage 5: Social Post Generation
  Agent: Social Media Agent per platform
  Input: Campaign angle + brand voice + platform style guide
  Action: Generate platform-specific posts for each open slot
  Platforms: LinkedIn, Instagram, Facebook, TikTok (captions only), YouTube Shorts (description)
  Output: content.schema.json records (status: 'draft')

Stage 6: Caption and Hashtag Generation
  Agent: Caption and Hashtag Agent
  Input: Post drafts + platform
  Action: Add platform-appropriate hashtags and optimize captions
  Output: Updated content records with hashtags

Stage 7: Video Brief Generation
  Agent: Gabriel Remotion Studio (brief stage only)
  Input: Campaign angle with strongest video potential (1-2 per day max)
  Action: Generate video concept brief (not full blueprint yet)
  Output: Video concept notes for review — if approved concept, full pipeline runs separately

Stage 8: Brand Voice Check
  Agent: Brand Voice Agent
  Input: All content drafts
  Action: Verify tone, voice, specificity per lane
  Output: brand_voice_pass flag on each draft

Stage 9: Compliance Check
  Agent: Compliance check
  Input: All content drafts
  Action: Run per COMPLIANCE_POLICY.md
  Output: compliance_flags on each draft

Stage 10: Content Calendar Update
  Agent: Content Calendar Agent
  Action: Add today's drafted content to calendar with status: 'draft'
  Output: Updated content calendar

Stage 11: Review Queue Submission
  Agent: Human Review Gateway
  Action: Create review_tickets for all content (ordered by priority_score)
  Output: review_tickets in Supabase

Stage 12: Alfred Notification
  Agent: Hermes → Telegram
  Message: "Marketing content ready: X posts, Y video concepts. Review queue has Z items."
```

---

## Content Targets Per Day

| Lane | LinkedIn | TikTok | Instagram | Facebook | YouTube Short |
|------|---------|--------|----------|----------|--------------|
| colvin_enterprises | 1 | 0 | 0 | 0 | 0 |
| music_theory_secrets | 0 | 2 | 1 | 1 | 0 |
| first_keys_indy | 0 | 0 | 1 | 1 | 0 |
| funding_ready_indiana | 1 | 0 | 0 | 0 | 0 |
| indiana_backflow | 0 | 0 | 0 | 1 | 0 |
| glory_engine | 0 | 1 | 1 | 0 | 0 |

**Daily video concept briefs:** 1-2 (not full blueprints — concepts only)
**Full video blueprints (separate DAILY_REMOTION_CONTENT_WORKFLOW):** 0-1 per day

---

## Integration Status

IMPLEMENTED (partial): automation-os/ generates content for lanes
PLANNED: Full staged pipeline with schema validation, content calendar tracking
