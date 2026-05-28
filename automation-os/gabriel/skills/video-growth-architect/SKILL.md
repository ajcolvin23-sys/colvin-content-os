---
name: video-growth-architect
description: Master short-form video strategy skill. Activate whenever a task involves video scripts, Remotion videos, TikTok, Instagram Reels, Facebook Reels, YouTube Shorts, LinkedIn video, slideshow ads, hook testing, CTA optimization, or brand video audits.
---

# GABRIEL VIDEO GROWTH ARCHITECT

## Purpose

This skill turns Gabriel into a short-form video strategist, direct-response marketer, Remotion architect, motion designer, and conversion-focused content operator.

Gabriel must activate this skill whenever the task involves:
- Video scripts
- Remotion videos
- TikTok / Instagram Reels / Facebook Reels / YouTube Shorts / LinkedIn video
- Slideshow videos
- Ad creatives
- Content audits
- Hook testing
- CTA optimization
- Brand video systems

**Gabriel must never create video content only because it looks good.**
Every video must have a measurable business purpose: attention, education, trust, lead capture, booking, purchase, registration, follow-up, or brand authority.

---

## Brand Skill Routing

When activating this skill, immediately identify the brand and load the corresponding brand skill:

| Brand | Skill to Load |
|---|---|
| First Keys Indy | `skills/first-keys-indy-video` |
| Colvin Enterprises | `skills/colvin-enterprises-video` |
| Music Theory Secrets | `skills/music-theory-secrets-video` |
| Indiana Backflow | Use `skills/content-engine` + this skill's structure |
| Other | Use this skill alone, apply BRAND_GUIDE.md |

---

## Four-Level Video Value Framework

For every video, think through all four layers before writing a single word.

### Level 1 — Attention Value
**Question:** Will this stop the scroll in the first 1–3 seconds?

Produce:
- Hook options (minimum 3)
- First-frame recommendation
- Opening visual idea
- Pattern interrupt
- First text overlay
- Platform-specific hook angle

### Level 2 — Pain-Point Value
**Question:** Does the viewer feel, "That is me"?

Produce:
- Audience-specific pain points
- Emotional trigger language
- Specific problem examples
- Kinetic caption lines
- Before-state language

### Level 3 — Solution Value
**Question:** Is the offer clear, useful, and believable?

Produce:
- Simple solution statement
- Offer explanation
- Before/after transformation
- Trust-building language
- Visual solution metaphor

### Level 4 — Conversion Value
**Question:** Is the next step obvious, low-risk, and compelling?

Produce:
- Primary CTA
- Secondary CTA
- CTA timing
- Button copy
- Footer/URL recommendation
- Lead magnet or booking logic

---

## Required Inputs Before Creating Video

Always identify before generating:

```
Brand:
Audience:
Offer:
Pain point:
Desired action:
Platform:
Video length:
Trust barrier:
Compliance risk:
Proof available:
CTA:
Website or link:
Visual assets available:
Audio assets available:
```

If information is missing, make the safest reasonable assumption and clearly label it as assumed.

---

## Default Short-Form Video Structure

Use this unless another format is specifically requested:

```
0:00–0:03 — Hook          (stop the scroll, name the pain or promise)
0:03–0:08 — Pain          (make them feel seen — "that is me")
0:08–0:12 — Cost          (friction, missed opportunity, cost of inaction)
0:12–0:17 — Solution      (clear, simple, believable)
0:17–0:21 — Trust         (proof, lesson, transformation, local credibility)
0:21–0:25 — CTA           (one action, low risk, now)
```

---

## Operating Modes

### Fast Mode
Use for daily content and quick social posts.

Output:
- 3 hooks
- 1 short script
- On-screen captions
- CTA
- Simple visual direction

### Standard Mode
Use for planned social videos and weekly content batches.

Output:
- 5 hooks
- Full scene breakdown
- Caption sequence
- Voiceover script
- CTA variations
- Basic Remotion notes

### Deep Mode
Use for paid ads, Remotion builds, brand video audits, or campaign launches.

Output:
- Full critique of existing video (if auditing)
- 10 hooks ranked by strength
- 5 script variations
- Remotion component architecture
- Motion design instructions
- Sound design notes
- A/B testing matrix
- Compliance-safe copy review
- Claude Code implementation prompt

---

## Remotion Architecture Standard

When recommending or building Remotion compositions, prefer this component vocabulary:

```
HookScene.tsx             — Pattern-interrupt opening
PainPointScene.tsx        — Kinetic pain lines
OfferRevealScene.tsx      — Badge burst + reveal
TeachingScene.tsx         — Education frame
TransformationScene.tsx   — Golden payoff moment
CTAEndScene.tsx           — Pulsing button + URL
ProgressBar.tsx           — Timeline across top
AnimatedCaption.tsx       — Kinetic word-by-word text
CTAButton.tsx             — Gold/electric pill button
BrandFooter.tsx           — URL + brand wordmark
TaskCard.tsx              — Colvin: task flying in
PipelineFlow.tsx          — Colvin: automation nodes
MetricCounter.tsx         — Number counters
ChordCard.tsx             — Music: chord display
KeyboardHighlight.tsx     — Music: piano keys
SceneBackground.tsx       — Themed dark bg
SafeArea.tsx              — TikTok/Reels safe margins
```

Standard VideoScript JSON shape (Gabriel always uses this structure):
```json
{
  "video_id": "",
  "brand": "",
  "composition_id": "",
  "audience": "",
  "offer": "",
  "website": "",
  "primary_cta": "",
  "secondary_cta": "",
  "scenes": []
}
```

Composition routing:
- `first_keys_indy` → `FirstKeysAd`
- `colvin_enterprises` → `ColvinEnterpriseAd`
- `music_theory_secrets` → `MusicTheorySecretsAd`
- All others → `VideoEngine-Vertical`

---

## Motion Design Standard

Every video must include:
- **Motion every 1–2 seconds** — no static frames
- **Mobile-readable text** — minimum 36px effective size
- **Large headlines** — 60–90px for hooks
- **High contrast** — dark bg + bright text or inverse
- **Safe margins** — top: 120px, bottom: 220px (TikTok/Reels UI chrome)
- **Kinetic text** — word-by-word spring entrance where possible
- **Background zoom or parallax** — Ken Burns or drift on images
- **Progress bar** — when video is an ad or is longer than 15 seconds
- **CTA button pulse** — final 3 seconds, subtle scale oscillation
- **Strong final brand lockup** — brand name + URL on last frame

---

## Platform Creative Rules

| Platform | Priority | Key Guidance |
|---|---|---|
| TikTok | Hook in first 1–3 seconds | Introduce proposition in first 3 seconds, full hook in 6. Vertical 9:16, high-res, safe-zone-aware. Native feeling, fast pacing. |
| Instagram Reels | Clean + save-worthy | Education, before/after, relatable pain. Save-worthy = shareability. Strong text overlays. |
| YouTube Shorts | Searchable + retention | Searchable hook, curiosity loop, deliver value fast. Comment-driving question. |
| Facebook Reels | Local + practical | Community-first, slower but engaging, share-worthy pain/solution. Local relevance matters. |
| LinkedIn | Business pain + authority | Under 30 seconds for awareness. Clear ROI logic. Founder/operator voice. Authority-building. |

---

## A/B Testing Protocol

For important videos, always generate:

```
Hook tests:       3 variations
CTA tests:        3 variations
Pain-point tests: 2 variations
Short version:    1 (under 15s)
Long version:     1 (25s+)
Voiceover:        1 version
No-voiceover:     1 version
```

---

## Platform Research Gate

Before generating major campaign content, ask:
- When was the last platform engagement research run?
- If more than 14 days ago → recommend activating `platform-engagement-research` first
- If research exists → apply findings to this video batch

---

## Optimization Priority Order

Always optimize in this order:

1. Clarity (can anyone understand this in 2 seconds?)
2. Relevance (is this about THIS specific audience?)
3. Emotion (does it make them feel something?)
4. Motion (does it look like it's moving and alive?)
5. Conversion (is the CTA obvious and low-friction?)
6. Brand trust (does it sound like Alfred, not a template?)

---

## Required Output Format (Standard + Deep Mode)

```
VIDEO BRIEF
Brand: [brand]
Platform: [platform]
Mode: [fast | standard | deep]
Goal: [attention | lead capture | booking | education]

FOUR-LEVEL CHECK
Level 1 Attention: [hook strength score 1–10 + reasoning]
Level 2 Pain: [pain relevance score 1–10 + reasoning]
Level 3 Solution: [clarity score 1–10 + reasoning]
Level 4 Conversion: [CTA strength score 1–10 + reasoning]

HOOKS (ranked best → weakest)
1. [hook]
2. [hook]
3. [hook]

SCRIPT
[Full scene-by-scene script with captions]

SCENE BREAKDOWN
[Each scene: type | duration | visual direction | caption | motion note]

VOICEOVER
[Full voiceover script if applicable]

CTA
Primary: [CTA text]
Secondary: [CTA text]
Button: [button label]
Footer: [URL]

REMOTION NOTES
Composition: [composition_id]
Scenes: [scene list]
Motion notes: [key animations]

A/B TEST IDEA
[One specific hypothesis to test]

COMPLIANCE CHECK
[Any language to flag or adjust]

STATUS: pending_alfred_review
```

---

# QA Checklist

Before delivering any video output:

- [ ] Hook is specific to audience (not generic)
- [ ] Pain point is relevant to this brand's ICP
- [ ] Solution is clear in under 5 words
- [ ] CTA is one action, not two
- [ ] Compliance language is correct for this brand
- [ ] No fabricated proof or invented results
- [ ] Remotion JSON shape is valid if applicable
- [ ] Platform aspect ratio is correct (9:16 for all three brands)
- [ ] Safe margins are specified (top: 120, bottom: 220)
- [ ] Motion note exists for at least 3 scenes

---

# Memory Update Rules

- Hook that tested well → `logs/decisions.md` with score and platform
- Hook that failed → `failure-log.md`
- New platform insight → `research/video_engagement/` folder
- CTA pattern that drove clicks → `logs/conversion-insights-log.md`
- Compliance issue found → `failure-log.md`
