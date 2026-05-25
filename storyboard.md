# Colvin Enterprises — Cinematic Story Storyboard
**Composition:** `ColvinEnterpriseCinematicStory`
**Format:** 1080 × 1920 vertical · 30 fps · 60 seconds (1800 frames)

---

## Scene 1 — The Vision
**Time:** 0 – 7 s (frames 0 – 210)
**Emotional beat:** Hope · Calling · Purpose

**Visuals:**
- Dark opening (#080A0F). Camera slowly pushes in (subtle scale 1.06 → 1.0)
- Gold/blue radial glow grows from center
- Vertical gold light beam
- "COLVIN ENTERPRISES" eyebrow in gold fades up
- Headline "Every mission / starts with a vision." reveals word-by-word with blur → sharp
- Sub text "An idea. A calling. A problem worth solving." staggers in
- Founder silhouette appears at bottom — backlit in gold, breathing subtly, laptop glowing

**Music cue:** Soft cinematic ambient intro  
**Sound cue:** Gold spark on first beat

---

## Scene 2 — The Pressure
**Time:** 7 – 16 s (frames 210 – 480)
**Emotional beat:** Hidden overwhelm · Buried vision

**Visuals:**
- Founder remains on screen
- "But vision gets buried…" headline appears
- 8 problem cards fly in from all directions with staggered 12-frame entrances:
  Missed leads · Manual follow-ups · Disconnected tools · Unposted content ·
  Slow website · No clear funnel · Too many tabs · Everything depends on you
- Cards have slight random rotations, red left borders
- Background dims progressively (vignette darkens 0 → 0.45 opacity)
- Cards begin compressing toward center

**Music cue:** Tension rise — faster BPM, low percussion  
**Sound cue:** Notification ping on each card

---

## Scene 3 — The Truth
**Time:** 16 – 24 s (frames 480 – 720)
**Emotional beat:** Recognition · Freeze · Clarity

**Visuals:**
- Background desaturates (#050507, low saturation filter)
- Problem cards freeze (clamped at frame 20)
- Gold light beam slices diagonally through the chaos
- Truth statements appear one by one:
  "You are not losing because you lack vision."
  [Red accent line draws in]
  "You do not have a systems problem."  ← GOLD, slight scale punch
  "Your systems cannot carry the mission."
- Deep cinematic moment — slow pace, high contrast

**Music cue:** Sudden silence → deep cinematic impact hit on "systems problem"  
**Sound cue:** Low pulse on each text line; impact hit on gold line

---

## Scene 4 — The System Arrives
**Time:** 24 – 34 s (frames 720 – 1020)
**Emotional beat:** Relief · Order · Structure

**Visuals:**
- Background: blue-tinted dark (#06080E)
- Headline: "Then systems change everything."
- Sub: "Colvin Enterprises builds the missing infrastructure."
- Hub + spoke system map reveals:
  - Central "Colvin System" gold hub appears first
  - 8 lines draw themselves outward to nodes (strokeDashoffset animation)
  - Node cards spring in staggered: Website · CRM · Content · Funnel (left) /
    Lead Capture · Follow-Up · AI Engine · Growth (right)
  - Data pulses travel along each spoke toward the hub

**Music cue:** Beat drop → system activation pulse  
**Sound cue:** Data connection pulse on each spoke draw

---

## Scene 5 — The Capability
**Time:** 34 – 46 s (frames 1020 – 1380)
**Emotional beat:** Confidence · Capability · Infrastructure

**Visuals:**
- Clean dark background
- "WHAT WE BUILD" eyebrow in gold
- Headline: "AI-powered systems / built to move your / mission forward."
- 6 service cards in 2×3 grid reveal with staggered spring from below:
  Websites · Lead Capture / CRM Workflows · AI Automation / Content Systems · Growth Funnels
- Each card: gold top border, icon, label, sub-label
- Glow sweep passes across each card on entry
- Subtle ambient gold glow on active cards

**Music cue:** Smooth confident tech groove  
**Sound cue:** Light UI swipe on each card reveal

---

## Scene 6 — The Transformation
**Time:** 46 – 55 s (frames 1380 – 1650)
**Emotional beat:** Momentum · Results · Mission moving

**Visuals:**
- Dark green background (#060D0A) — success tone
- Green light beam subtle background
- "When your systems work…" headline
- "your mission / moves faster." in gold
- Animated dashboard below:
  - Lead pipeline: 4 stage cards slide in (New Lead → Contacted → Follow-Up → Converted)
  - Follow-up toggle switches ON with a spring
  - Growth bar fills left to right (0% → 72%)
  - Divider line fades in
  - 5 result items reveal staggered:
    ✅ Leads captured. · ✅ Follow-up automated. · ✅ Content organized.
    ✅ Growth repeated. · ✅ Mission moving.
- Whole scene drifts upward slightly (momentum lift)

**Music cue:** Warm uplift — pipeline clicks, rising warm tone  
**Sound cue:** Success pulse as dashboard activates

---

## Scene 7 — The Brand CTA
**Time:** 55 – 60 s (frames 1650 – 1800)
**Emotional beat:** Premium · Memorable · Action

**Visuals:**
- Deepest dark (#050507)
- Subtle gold digital grid overlay fades in
- Gold/blue radial glow expands (centered, shifted up)
- Pulsing gold ring around glow
- Flanking ornament — ─── ● ─── reveals
- "Colvin Enterprises" — 76px bold, spring entrance
- "Turning mission into momentum." in gold
- CTA box with border: "Visit us at" + "colvinenterprise.info"
- Bottom closing line: "BUILD THE SYSTEM. MOVE THE MISSION."
- Screenshot-worthy final frame — holds for 5 seconds

**Music cue:** Final logo shimmer — soft premium resolve  
**Sound cue:** Gold shimmer on brand name reveal

---

## Edit Locations

| What to change          | File                                              |
|-------------------------|---------------------------------------------------|
| Colors / fonts          | `remotion/ColvinEnterprises/CinematicStory/theme.ts` |
| Scene timing            | `theme.ts` → `SCENES` object                     |
| Problem cards (8)       | `components/ProblemStorm.tsx` → `PROBLEM_CARDS`  |
| Service cards (6)       | `components/ServiceEcosystem.tsx` → `SERVICES`   |
| Dashboard results (5)   | `components/DashboardTransformation.tsx` → `RESULTS` |
| CTA copy / URL          | `components/FinalCTA.tsx` constants at top        |
| Scene headlines         | `ColvinEnterpriseCinematicStory.tsx` scene components |
| System map nodes (8)    | `components/SystemMap.tsx` → `NODES`             |

---

## Render Commands

```bash
# Preview in Remotion Studio
npm run remotion

# Render vertical (TikTok / Reels / Shorts)
npm run render:cinematic:vertical
# → out/colvin-enterprise-cinematic-story.mp4

# Render widescreen (YouTube / LinkedIn)
npm run render:cinematic:wide
# → out/colvin-enterprise-cinematic-story-wide.mp4

# One-frame sanity check (frame 30 = 1-second mark)
npx remotion still remotion/index.ts ColvinEnterpriseCinematicStory --frame=30 --scale=0.5
```
