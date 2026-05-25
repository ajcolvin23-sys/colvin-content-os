# Gabriel Business Execution Agent — Colvin Content OS

Gabriel runs Alfred's daily business growth cycle. This document defines how Gabriel coordinates all sub-agents to produce daily value across all 9 business lanes.

---

## Daily Business Growth Cycle

### Phase 1: Intelligence Gathering (7:00–7:30 AM ET)
- Load gabriel-config.json and lane configurations
- Load last 7 days of content calendar for each lane
- Check what was approved but not yet published
- Research trending topics via Firecrawl MCP for each active lane:
  - Colvin Enterprises: AI automation, Indianapolis business news
  - Music Theory Secrets: gospel piano, music education, worship trending
  - First Keys Indy: Marion County housing, DPA updates, Indiana Housing Finance Authority
  - FundingReady Indiana: Indiana grant news, SBA updates, IEDC announcements
  - GloryEngine: faith media, gospel content, Yahweh Comics adjacent

### Phase 2: Lead Generation (7:30–8:00 AM ET)
- For each active lead-gen lane: dispatch Lead Finder Agent with lane playbook
- Enrich and score new leads
- Dedup against existing CRM
- Qualified leads (score 7+): dispatch to Email Copy Agent for outreach draft
- Lower-scored leads: save to CRM with status = 'scored'

### Phase 3: Content Creation (8:00–9:00 AM ET)
- For each active lane: dispatch Vibe Marketing Agent
  - Research trending hooks
  - Generate 2-3 post variations per platform
  - Generate short-form video concept
- Dispatch Gabriel Remotion Studio for each lane with open video slot:
  - Generate full video blueprint (scene plan + script + assets)
  - Validate against remotion_video.schema.json
- Dispatch Caption and Hashtag Agent for all posts

### Phase 4: Compliance and Review Queue (9:00–9:30 AM ET)
- Run compliance check on all generated items
- Flag any items with severity:block — these go to top of review queue
- Create review_ticket records for all items
- Sort queue by priority_score
- Send Telegram summary to Alfred

### Phase 5: Approval Monitoring (Ongoing)
- Poll review_tickets every 5 minutes for Alfred's decisions
- On approval: move to appropriate execution queue
- On rejection: archive, log feedback
- On revision request: regenerate once with feedback, re-queue

---

## Sub-Agent Coordination

Gabriel dispatches to and receives from:

| Sub-Agent | What Gabriel Sends | What Gabriel Receives |
|-----------|-------------------|-----------------------|
| Lead Finder | Lane playbook + target parameters | Raw lead JSON array |
| Lead Enrichment | Raw leads | Enriched leads |
| Vibe Marketing | Lane + trend brief | Campaign angles |
| Social Media | Campaign angle + brand voice | Content drafts |
| Gabriel Remotion Studio | Campaign brief + scene requirements | Video blueprint JSON |
| Email Copy | Lead + context + lane | Outreach draft |
| Caption/Hashtag | Content draft + platform | Captions + hashtags |
| Compliance check | All outputs | Compliance flags |

---

## Lane-Specific Execution Notes

### Colvin Enterprises
- LinkedIn is the primary channel
- Content: AI automation case studies, Indianapolis business transformation, "how we built this" posts
- Lead goal: 5-10 qualified Indianapolis B2B leads per week
- Video: LinkedIn short videos + YouTube Shorts on AI consulting

### Music Theory Secrets
- YouTube + Facebook + TikTok
- Content: gospel piano tips, "secret chords," worship musician hacks
- Book funnel: all content links to music theory book sales page
- Video: Remotion lesson-style videos, chord reveal videos, testimony-style

### First Keys Indy
- Facebook + Instagram (Marion County audience)
- Content: DPA eligibility info, homebuyer success stories, application tips
- All content: HUD/RESPA check before review queue
- No income guarantees, no specific dollar amounts without source citation

### FundingReady Indiana
- LinkedIn + Email
- Content: Indiana grant announcements, SBA resources, success stories
- Lead funnel: free grant checklist → email sequence

### Indiana Backflow Directory
- Google-first (SEO), Facebook secondary
- Content: local SEO posts, county coverage announcements, "find a tester near you"
- Lead goal: plumbers + property managers + facilities directors

---

## Review Queue Management Rules

- Maximum 3 outreach drafts per lane per day in the queue
- Maximum 5 social posts per lane per day in the queue
- Maximum 2 video blueprints per day total
- If queue depth > 20: pause new outreach drafts, continue content
- If queue depth > 50: pause all new generation, alert Alfred

---

## Integration Status

- IMPLEMENTED: 15-step Gabriel daily sequence in automation-os/
- IMPLEMENTED: Telegram notifications via bot
- IMPLEMENTED: gabriel-config.json lane configuration
- PLANNED: Full sub-agent orchestration with stage-level durable state
- PLANNED: Review queue dashboard at /dashboard/review
