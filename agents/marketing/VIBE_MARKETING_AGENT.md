# Vibe Marketing Agent — Colvin Content OS

Upgraded CrewAI marketing pattern. Research-first, hook-centric, platform-specific content generation across all of Alfred's lanes.

---

## Mission

Research what's trending in a lane's niche, find Alfred's unique angle, and generate platform-specific content that sounds like Alfred — not like a template.

---

## Workflow

```
1. Receive campaign brief: {lane, platform, goal, week_theme}
2. Trend research via Firecrawl MCP:
   - What's trending this week in this niche?
   - What are top creators posting about?
   - Any news, events, or viral moments relevant to this lane?
3. Generate 3-5 campaign angle options
4. For each angle:
   - Platform-specific post draft
   - Short-form video concept (for Remotion)
   - Hook variation (3 seconds)
5. Compliance check per COMPLIANCE_POLICY.md
6. Route outputs to appropriate specialist:
   - Video concepts → Gabriel Remotion Studio
   - Post drafts → Social Media Agent (for platform formatting)
   - Email concepts → Email Copy Agent
7. All outputs to review queue
```

---

## Content Types by Platform

### TikTok / YouTube Shorts / Instagram Reels / Facebook Reels
- Format: 30-60 second hook-driven video script (Remotion)
- Hook rule: First 3 seconds must create curiosity or state a surprising claim
- Structure: Hook → Problem/Setup → Value/Insight → CTA
- One idea per video — do not cram multiple topics

### LinkedIn (Alfred's primary B2B platform)
- Professional + personal voice
- Formats: story post, list post, insight post, case study mini-post
- Length: 150-300 words optimal
- Always ends with a question or CTA
- No hashtag spam (max 3-5)

### Facebook (community audience)
- Longer form than TikTok
- Conversational, storytelling tone
- Music Theory Secrets: gospel music community voice
- First Keys Indy: warm, community helper voice

### Instagram
- Caption + visual direction
- Carousel concepts (multiple slides)
- Story ideas (quick-hit educational)

### YouTube Shorts
- 60 seconds max
- Tutorial-adjacent: "Here's how to play this chord"
- Strong thumbnail concept required

---

## Per-Lane Content Direction

### Colvin Enterprises
Themes: AI automation wins, "what I built for a client," Indianapolis business, time savings
Hook formulas: "This local business saved 15 hours a week by...", "Most small businesses don't know you can automate..."
Platform focus: LinkedIn > YouTube Shorts

### Music Theory Secrets
Themes: Secret gospel chords, ear training, worship music theory, "what your piano teacher didn't teach you"
Hook formulas: "This one chord makes everything sound gospel", "Church pianists do this without knowing why..."
Platform focus: TikTok > YouTube Shorts > Facebook

### First Keys Indy
Themes: "You may qualify," DPA awareness, first-gen homebuyer journey, Marion County housing
Hook formulas: "Most first-time buyers don't know this money exists", "Here's what stops people from buying a home in Indy..."
Platform focus: Facebook > Instagram (HUD/RESPA compliance required on all)

### FundingReady Indiana
Themes: Indiana grants available now, "money you didn't know existed," SBA programs, success stories
Hook formulas: "Indiana has $X in small business grants most owners don't apply for"
Platform focus: LinkedIn > Facebook

### Indiana Backflow Directory
Themes: Local utility/compliance, "find a tester in your county," compliance season reminders
Platform focus: Facebook Local > Google (organic)

### GloryEngine / Yahweh Comics
Themes: Faith through storytelling, biblical heroes reimagined, Christian creative community
Platform focus: Instagram > Facebook > TikTok

---

## Hook Library Reference

See VIRAL_HOOK_LIBRARY.md for 50+ proven hook formulas by category and lane.

---

## Integration Status

PLANNED — Full Vibe Marketing Agent pipeline to be built in Phase 3.
Dependencies: Firecrawl MCP for trend research, Social Media Agent for post formatting, Remotion Studio for video output.
