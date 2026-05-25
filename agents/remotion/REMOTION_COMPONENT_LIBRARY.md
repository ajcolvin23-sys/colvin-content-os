# Remotion Component Library — Colvin Content OS

Documentation of all Remotion components available in Gabriel Remotion Studio.

---

## Component Index

| Component | File | Purpose | Default Duration |
|-----------|------|---------|----------------|
| HeroHookScene | components/HeroHookScene.tsx | Opening hook | 3-5s |
| ProblemAgitationScene | components/ProblemAgitationScene.tsx | Pain point setup | 4-8s |
| ProofPointScene | components/ProofPointScene.tsx | Social proof / credibility | 5-10s |
| OfferRevealScene | components/OfferRevealScene.tsx | Solution reveal | 5-12s |
| StepByStepScene | components/StepByStepScene.tsx | Tutorial step | 4-8s |
| TestimonialStyleScene | components/TestimonialStyleScene.tsx | Story / quote | 5-10s |
| CTAEndCard | components/CTAEndCard.tsx | Final CTA (always last) | 5-10s |
| CaptionLayer | components/CaptionLayer.tsx | Auto-captions overlay | continuous |
| ProgressBar | components/ProgressBar.tsx | Video progress indicator | continuous |
| AnimatedText | components/AnimatedText.tsx | Text animation | varies |
| LogoIntro | components/LogoIntro.tsx | Brand logo intro | 3-5s |
| LowerThird | components/LowerThird.tsx | Name/title overlay | 3-6s |
| ImageSlideshowScene | components/ImageSlideshowScene.tsx | Image slideshow | varies |
| DataCardScene | components/DataCardScene.tsx | Stats / key data | 4-8s |

Full prop specifications in REMOTION_COMPONENT_SPEC.md.

---

## HeroHookScene

**What it does:** Full-screen opening with bold hook text. Designed to stop the scroll.
**Visual output:** Large text on gradient or image background, optional zoom-in animation.
**When to use:** Always as Scene 1 for short-form videos.
**Key visual:** Text must be readable at 50% screen size (mobile preview).

---

## ProblemAgitationScene

**What it does:** Names the pain point or creates tension. Dark/contrast visual signals "this is serious."
**Visual output:** Text on dark overlay, optional secondary copy below.
**When to use:** Scene 2-3 in educational or transformation videos.
**Key visual:** Creates emotional contrast with the solution scenes that follow.

---

## ProofPointScene

**What it does:** Shows a statistic, testimonial reference, or result claim.
**Visual output:** Card or overlay with primary metric + source attribution.
**When to use:** After value delivery to build credibility. Never first.
**Compliance note:** `sourceText` is required for any numerical statistic.

---

## OfferRevealScene

**What it does:** Reveals the solution, product, or offer with visual emphasis.
**Visual output:** Product image or bold text reveal with brand colors.
**When to use:** After problem and value setup. Not as the hook.

---

## StepByStepScene

**What it does:** Numbered step in a tutorial or process. Includes optional progress bar.
**Visual output:** Step number + title + description + optional visual.
**When to use:** For tutorials, how-tos, process explanations.
**Best for:** Music Theory Secrets chord lessons, Colvin Enterprises workflow demos.

---

## TestimonialStyleScene

**What it does:** Displays a quote or story-based content.
**Visual output:** Quote text with attribution in styled quote card.
**When to use:** Transformation stories, First Keys Indy homebuyer stories, music student results.
**Privacy note:** Use role-based attribution only: "First-time homebuyer, Marion County" — not full names.

---

## CTAEndCard

**What it does:** Final call to action. Always the last scene.
**Visual output:** CTA text + brand logo + optional social handles.
**When to use:** Every video. Required.
**Compliance note:** CTA must match approved CTAs from GABRIEL_BRAND_MEMORY_POLICY.md.

---

## CaptionLayer

**What it does:** Renders caption overlay synchronized with voiceover timing.
**Visual output:** Text captions at bottom (or specified position) of screen throughout video.
**When to use:** Every video. Required for accessibility.
**Dependency:** Requires caption timing data from Remotion Caption Timing Agent.

---

## ProgressBar

**What it does:** Shows video watch progress at top or bottom of screen.
**Visual output:** Thin animated progress bar.
**When to use:** Optional for longer videos (60s+). Not recommended for short-form (distracts from content).

---

## AnimatedText

**What it does:** Animated text entrance effects — word by word, char by char, etc.
**Visual output:** Text that enters with animation.
**When to use:** Emphasis moments, key facts, section transitions.

---

## LogoIntro

**What it does:** Brand logo intro sequence for longer videos.
**Visual output:** Logo animation on branded background.
**When to use:** Optional. Only for YouTube videos and longer-form content. Too slow for TikTok/Reels.

---

## LowerThird

**What it does:** Small overlay at bottom of screen showing name, role, or fact.
**Visual output:** Animated bar or pill with text.
**When to use:** When introducing Alfred, citing a source, or adding a fact without interrupting the main visual.

---

## ImageSlideshowScene

**What it does:** Displays multiple images in sequence with captions.
**Visual output:** Image sequence with transition effects and optional text overlay.
**When to use:** Slideshow videos, product reveals, piano lesson series.

---

## DataCardScene

**What it does:** Highlights a key statistic or data point with visual emphasis.
**Visual output:** Card design with metric, label, and optional count-up animation.
**When to use:** FundingReady Indiana grant amounts, First Keys Indy eligibility stats (with source), business results.
**Compliance note:** Always include `sourceText` for numerical data.
