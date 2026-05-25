# Remotion Content System — Colvin Content OS

Master overview of the Gabriel Remotion Studio — the primary creative engine for all video content across all 9 business lanes.

**Remotion replaces Canva entirely. Gabriel Creative Studio = Remotion Content Studio. No Canva. No manual video assembly. Remotion is the source of truth for all video content.**

---

## What Remotion Is

Remotion is a framework for creating videos programmatically using React components. In the Colvin Content OS, it serves as the complete video production pipeline — from script to rendered MP4 — driven by structured JSON blueprints that agents generate and Alfred approves.

---

## System Architecture

```
Alfred (approves blueprint)
  ↑
Human Review Gateway (review_ticket: remotion_video)
  ↑
Compliance Check Agent (claims check, compliance flags)
  ↑
Remotion Video Agent (assembles full blueprint JSON)
  ↑
┌─────────────────────────────────────┐
│  Remotion Script Writer             │  ← Hook + voiceover + on-screen text + CTA
│  Remotion Scene Planner             │  ← Scenes + durations + components + motion
│  Remotion Caption Timing Agent      │  ← Word-by-word caption timing data
│  Remotion Asset Manifest Agent      │  ← Required assets + license verification
└─────────────────────────────────────┘
  ↑
Remotion Template Agent (selects best-fit template from library)
  ↑
Gabriel Remotion Studio (coordinates concept → blueprint)
  ↑
Gabriel Campaign Router (routes video requests here)
  ↑
Daily Remotion Content Workflow (10 AM ET daily cron)
  ↓ (after Alfred's approval)
Remotion MCP render trigger
  ↓
Rendered MP4 → Supabase storage URL → Telegram delivery to Alfred
```

---

## Blueprint-Driven Production

Every video starts as a JSON blueprint conforming to `schemas/remotion_video.schema.json`. The blueprint is the contract between the agents that generate content and the Remotion renderer that produces the final video.

**Blueprint key sections:**
- `campaign` — lane, theme, goal, target audience
- `platform` — tiktok | youtube_shorts | instagram_reels | facebook_reels | linkedin_video
- `duration_seconds` — 15 | 30 | 45 | 60 | 90
- `format` — 9:16 (mobile) | 1:1 (square) | 16:9 (landscape)
- `scenes[]` — each scene has component, duration, text, motion, assets
- `voiceover_script` — full narration text
- `captions[]` — word-by-word timing for accessibility
- `asset_manifest[]` — all required assets with license status
- `brand_styles` — colors, fonts, logo placement per lane
- `claims_check` — risk level, any flagged claims
- `approval_required` — always `true`
- `render_status` — draft → approved → rendering → rendered → failed

---

## 14 Remotion Components

| Component | Purpose |
|-----------|---------|
| HeroHookScene | Opening 3-second hook |
| ProblemAgitationScene | Problem/pain point framing |
| ProofPointScene | Testimonial-style proof |
| OfferRevealScene | Service/product reveal |
| StepByStepScene | Tutorial numbered steps |
| TestimonialStyleScene | Social proof quotes |
| CTAEndCard | Closing call-to-action |
| CaptionLayer | Animated subtitle overlay |
| ProgressBar | Visual progress indicator |
| AnimatedText | Kinetic typography |
| LogoIntro | Lane logo animation |
| LowerThird | Speaker lower-third |
| ImageSlideshowScene | Photo slideshow (gallery style) |
| DataCardScene | Stats and data visualization |

Full TypeScript interface definitions: `remotion/REMOTION_COMPONENT_SPEC.md`

---

## 8 Video Templates

| Template ID | Duration | Use Case |
|-------------|----------|---------|
| hook_reveal_30 | 30s | Hook + problem + offer reveal |
| hook_teaching_45 | 45s | Educational hook + key insight |
| transformation_60 | 60s | Before/after transformation story |
| offer_reveal_30 | 30s | Direct offer with CTA |
| slideshow_music_45 | 45s | Photo slideshow with music |
| local_awareness_30 | 30s | Local business awareness |
| announcement_15 | 15s | Quick announcement |
| faith_story_60 | 60s | Faith-based story arc |

Full template structures: `remotion/REMOTION_TEMPLATE_LIBRARY.md`

---

## Video Types by Lane

| Lane | Primary Video Types | Platforms | Duration |
|------|--------------------|-----------|---------:|
| music_theory_secrets | Chord reveal, piano lesson, book promo | TikTok, Instagram, YouTube Shorts | 30-60s |
| colvin_enterprises | B2B authority, AI demo, case study | LinkedIn | 60-90s |
| first_keys_indy | Homebuyer tip, program announcement, testimonial | Instagram, Facebook | 30-60s |
| funding_ready_indiana | Grant announcement, business tip | Facebook, LinkedIn | 30-60s |
| indiana_backflow | Backflow awareness, certification explainer | Facebook | 30-60s |
| glory_engine | Faith story, Yahweh Comics preview | Instagram, TikTok | 30-60s |
| girls_got_game | Youth program announcement, community story | Instagram, Facebook | 30-60s |
| piano_app | App feature reveal, learning tip | TikTok, YouTube Shorts | 15-30s |
| youtube_music_education | Full lesson hook, channel promo | YouTube Shorts | 60s |

---

## Approval Gate — Non-Negotiable

**`approval_required` is always `true`. There is no bypass.**

The render trigger fires ONLY after Alfred approves the blueprint in the review queue. The workflow pauses at Stage 10 until Alfred acts. If Alfred rejects, the blueprint is marked `render_status: 'failed'` and Hermes logs the rejection. If Alfred requests revision, the Remotion Video Agent regenerates with Alfred's feedback.

---

## Brand Styling Per Lane

| Lane | Primary Color | Secondary | Font | Logo Placement |
|------|--------------|-----------|------|----------------|
| music_theory_secrets | #1a1a2e | #e94560 | Inter | top-right |
| colvin_enterprises | #0a192f | #64ffda | Poppins | bottom-left |
| first_keys_indy | #1e3a5f | #ffd700 | Roboto | top-left |
| funding_ready_indiana | #1b4332 | #40916c | Lato | bottom-right |
| indiana_backflow | #003049 | #fcbf49 | Montserrat | bottom-left |
| glory_engine | #2d0057 | #c77dff | Merriweather | center-top |
| girls_got_game | #ff477e | #ffbe0b | Nunito | top-right |
| piano_app | #0d1b2a | #e2b714 | Inter | bottom-right |
| youtube_music_education | #ff0000 | #282828 | Roboto | top-left |

---

## Quality Checklist Summary

Before render: 25-item checklist covering script, compliance, format, assets, schema.
After render: 25-item checklist covering technical quality, captions, visuals, content accuracy.

Full checklist: `remotion/REMOTION_VIDEO_QA_CHECKLIST.md`

---

## Content Volume

| Metric | Value |
|--------|-------|
| Max blueprints per daily cron run | 1 |
| Manual trigger (Alfred request) | Unlimited |
| Video concept briefs per day | 1-2 (from Daily Marketing Workflow) |
| Full blueprints per week (target) | 3-5 |

---

## File Map

| File | Purpose |
|------|---------|
| `remotion/GABRIEL_REMOTION_STUDIO.md` | Master coordinator doc |
| `remotion/REMOTION_VIDEO_AGENT.md` | Blueprint assembly agent |
| `remotion/REMOTION_TEMPLATE_AGENT.md` | Template selection |
| `remotion/REMOTION_SCENE_PLANNER.md` | Scene planning |
| `remotion/REMOTION_SCRIPT_WRITER.md` | Script generation |
| `remotion/REMOTION_CAPTION_TIMING_AGENT.md` | Caption timing |
| `remotion/REMOTION_ASSET_MANIFEST_AGENT.md` | Asset manifest |
| `remotion/REMOTION_RENDER_QA_AGENT.md` | QA checklist agent |
| `remotion/REMOTION_COMPONENT_SPEC.md` | TypeScript interfaces for all 14 components |
| `remotion/REMOTION_COMPONENT_LIBRARY.md` | Component usage guide |
| `remotion/REMOTION_TEMPLATE_LIBRARY.md` | All 8 templates |
| `remotion/REMOTION_RENDER_PIPELINE.md` | Full 14-stage pipeline |
| `remotion/REMOTION_ASSET_POLICY.md` | Asset licensing rules |
| `remotion/REMOTION_VIDEO_QA_CHECKLIST.md` | 25-item QA checklist |
| `remotion/REMOTION_SHORT_FORM_VIDEO_PLAYBOOK.md` | Short-form video rules |
| `remotion/REMOTION_SLIDESHOW_VIDEO_PLAYBOOK.md` | Slideshow rules |
| `remotion/REMOTION_VIDEO_SCHEMA.md` | Schema field documentation |
| `schemas/remotion_video.schema.json` | The JSON Schema (source of truth) |
| `workflows/DAILY_REMOTION_CONTENT_WORKFLOW.md` | Full 14-stage workflow |
| `scripts/remotion-render-smoke.md` | How to smoke test the Remotion MCP |

---

## Integration Status

REQUIRES SETUP: `REMOTION_MCP_URL` env var must be set.
PLANNED: Full render pipeline — Phase 3.
Current: Remotion MCP active, blueprint schema defined, template library specified. Build begins in Phase 3.
