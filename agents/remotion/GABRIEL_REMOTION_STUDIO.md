# Gabriel Remotion Studio — Colvin Content OS

**THE MASTER REMOTION DOCUMENT.**

Gabriel Remotion Studio is the primary creative generation engine for Colvin Content OS. Remotion has fully replaced Canva. Every video and visual content piece goes through this system.

---

## What Gabriel Remotion Studio Does

Gabriel Remotion Studio takes a campaign brief and produces a complete, render-ready JSON blueprint — a structured specification that maps directly to Remotion React components, scenes, scripts, captions, and assets.

**Remotion Studio is the answer to every visual content need.**

---

## Video Types Supported

| Video Type | Platform | Format | Duration |
|-----------|---------|--------|---------|
| TikTok short | TikTok | 9:16 | 30-60s |
| YouTube Shorts | YouTube | 9:16 | 15-60s |
| Instagram Reels | Instagram | 9:16 | 15-90s |
| Facebook Reels | Facebook | 9:16 | 15-60s |
| LinkedIn short video | LinkedIn | 16:9 or 1:1 | 30-90s |
| Educational explainer | YouTube / LinkedIn | 16:9 | 2-5 min |
| Book promo | All platforms | 9:16 or 1:1 | 30-60s |
| Gospel piano lesson | TikTok / YouTube Shorts | 9:16 | 30-90s |
| Gospel chord reveal | TikTok | 9:16 | 15-30s |
| AI automation demo | LinkedIn / YouTube | 16:9 | 60-120s |
| DPA homebuyer awareness | Facebook / Instagram | 9:16 | 30-60s |
| Grant announcement | LinkedIn / Facebook | 1:1 | 30-45s |
| Indiana Backflow awareness | Facebook Local | 1:1 | 30s |
| Slideshow video | All platforms | varies | 30-120s |
| Logo/brand intro | All platforms | varies | 5-10s |
| Event promo | All platforms | 9:16 | 15-30s |
| Church/faith video | Facebook / Instagram | 9:16 | 30-60s |
| Yahweh Comics teaser | Instagram / TikTok | 9:16 | 15-30s |

---

## Full Workflow: Concept to Render-Ready Blueprint

```
Step 1: Campaign Brief
  Input: {lane, platform, goal, audience, week_theme, campaign_id}
  
Step 2: Video Concept (Remotion Scene Planner)
  - Hook concept
  - Scene structure
  - Visual style direction
  
Step 3: Script Writing (Remotion Script Writer)
  - Hook (first 3 seconds)
  - Voiceover script
  - On-screen text per scene
  - CTA

Step 4: Scene Planning (Remotion Scene Planner)
  - Scene count and durations
  - Component assignment per scene
  - Motion direction
  - Transition types
  
Step 5: Caption Timing (Remotion Caption Timing Agent)
  - Word-by-word timing data
  - Caption groupings for display
  - Accessibility metadata

Step 6: Asset Manifest (Remotion Asset Manifest Agent)
  - Images needed
  - Icons
  - Fonts
  - Music direction
  - B-roll descriptions
  
Step 7: Schema Validation
  - Validate full blueprint against remotion_video.schema.json
  - Claims check (compliance)
  - Brand voice check
  
Step 8: Review Queue
  - Alfred reviews full blueprint
  - If approved: render trigger
  - If changes: revision loop
  
Step 9: Render Trigger (after approval)
  - Send blueprint to Remotion MCP
  - Monitor render status
  
Step 10: Render QA (Remotion Render QA Agent)
  - Duration check
  - Frame rate check
  - Caption sync check
  - CTA visible
  - Brand alignment
  - PASS/FAIL report
  
Step 11: Delivery
  - Store render metadata in Supabase
  - Notify Alfred via Telegram
  - Store output URL
```

---

## Remotion Component Architecture

Every video is composed of scenes. Each scene uses a Remotion React component:

| Component | Use Case |
|-----------|---------|
| `HeroHookScene` | Opening hook — full-screen text or visual |
| `ProblemAgitationScene` | State the pain point |
| `ProofPointScene` | Show evidence, results, or social proof |
| `OfferRevealScene` | Reveal the solution or offer |
| `StepByStepScene` | Tutorial or how-to breakdown |
| `TestimonialStyleScene` | Quote or story-based content |
| `CTAEndCard` | Final CTA with text + visual |
| `CaptionLayer` | Auto-caption overlay (always present) |
| `ProgressBar` | Video progress indicator |
| `AnimatedText` | Text animation for on-screen copy |
| `LogoIntro` | Brand logo intro (3-5 seconds) |
| `LowerThird` | Name, title, or fact lower-third |
| `ImageSlideshowScene` | Multiple images in sequence |
| `DataCardScene` | Statistics or key data points |

Full component specs in REMOTION_COMPONENT_SPEC.md.

---

## Brand Styling by Lane

| Lane | Primary Colors | Typography | Visual Style |
|------|--------------|-----------|-------------|
| colvin_enterprises | Deep blue + gold | Clean sans-serif | Professional, minimal |
| music_theory_secrets | Purple + gold | Bold + expressive | Dynamic, music-inspired |
| first_keys_indy | Teal + warm orange | Friendly sans-serif | Community, welcoming |
| funding_ready_indiana | Green + navy | Professional sans-serif | Credible, informative |
| indiana_backflow_directory | Blue + silver | Clean sans-serif | Professional, local |
| girls_got_game | Bright coral + purple | Bold, energetic | Energetic, youth-positive |
| glory_engine | Gold + deep purple | Dramatic, serif accent | Epic, faith-inspired |

---

## What Gabriel Remotion Studio Does NOT Do

- Does NOT render videos without Alfred's explicit approval
- Does NOT publish videos to any platform
- Does NOT use Canva — Remotion only
- Does NOT generate audio (voiceover) — audio is described in script, recorded separately or via TTS if configured
- Does NOT store raw video files — stores the JSON blueprint and render metadata

---

## Integration Status

- REQUIRES SETUP: Remotion MCP (REMOTION_MCP_URL must be set)
- PLANNED: Full blueprint generation pipeline
- REFERENCE: Remotion package in Next.js stack

See also: REMOTION_RENDER_PIPELINE.md, REMOTION_VIDEO_SCHEMA.md, REMOTION_TEMPLATE_LIBRARY.md
