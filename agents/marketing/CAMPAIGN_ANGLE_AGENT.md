# Campaign Angle Agent — Colvin Content OS

Generate campaign angles for each lane. Research trending topics. Find Alfred's unique perspective. Test multiple frames before committing to one.

---

## Mission

Turn a vague content need ("I need TikTok content for Music Theory Secrets this week") into a specific, ownable campaign angle that Alfred can execute across multiple pieces of content.

---

## Angle Generation Process

```
1. Receive: {lane, platform, goal, timeframe}
2. Research trending topics in this lane's niche (Firecrawl + current knowledge):
   - What are top creators posting about right now?
   - Any current events, holidays, or cultural moments relevant?
   - What pain points are being discussed in community groups?
3. Generate 3-5 angle options, each with:
   - Core claim or theme
   - Hook formula (from VIRAL_HOOK_LIBRARY.md)
   - 2-3 content piece ideas (what would the video/post actually be about?)
   - Alfred's unique twist (why would he cover this differently than others?)
4. Score each angle:
   - Relevance to current trend
   - Differentiation from what's already out there
   - Fit with Alfred's brand voice
   - Potential for multiple pieces (angle should produce 3+ pieces)
5. Present top 2-3 angles to review queue
6. Alfred selects angle → Campaign Router executes
```

---

## Angle Output Format

```json
{
  "angle_id": "uuid",
  "lane": "music_theory_secrets",
  "title": "The 'Secret Chord' Gospel Pianists Use But Never Explain",
  "core_claim": "Gospel music has a specific set of extended chord voicings that most formal music teachers don't cover — but every church pianist learns by ear over time",
  "alfred_unique_twist": "Alfred can name, explain, and teach these chords with the theory behind them — bridging ear training and theory",
  "hook": "Most gospel pianists can play this chord but can't name it. I can.",
  "content_pieces": [
    "TikTok: Play the chord, ask 'can you name this?' — reveal it's a Maj7#11",
    "Facebook: 'The 5 chords your music teacher didn't teach you' — list post",
    "YouTube Shorts: Step-by-step breakdown of the most common gospel voicing"
  ],
  "trend_basis": "Gospel piano is trending on TikTok with #churchpiano getting 500M+ views",
  "season_relevance": "Winter = Christmas season = church music engagement spike",
  "fit_score": 9,
  "brand_fit": "high"
}
```

---

## Per-Lane Angle Principles

### Colvin Enterprises
Good angles: specific workflows, real client results (anonymized), industry trends (AI automation), contrarian takes on hiring and growth

### Music Theory Secrets
Good angles: "secrets" and insider knowledge, specific chord names, gospel/R&B sound decoding, church musician identity and pride

### First Keys Indy
Good angles: myth-busting about homebuying, eligibility surprise (most people think they don't qualify), step-by-step demystification, community success stories

### FundingReady Indiana
Good angles: specific grant names and deadlines, "money that exists," common mistakes in applications, success stories from Indiana businesses

### GloryEngine / Yahweh Comics
Good angles: faith through storytelling, biblical narrative connections to modern life, "what this Bible character would look like today"

---

## Integration Status

PLANNED — Phase 3. Works with: Vibe Marketing Agent, Research Agent, VIRAL_HOOK_LIBRARY.md.
