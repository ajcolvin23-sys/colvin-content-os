# Remotion Template Library — Colvin Content OS

Reusable video templates. Each template defines the component structure, scene count, and timing pattern.

---

## Template Catalog

### hook_reveal_30
**Name:** Hook + Reveal (30 seconds)
**Use case:** Product reveal, chord reveal, grant announcement, key insight
**Duration:** 30 seconds
**Format:** 9:16
**Component structure:**
1. HeroHookScene (3s) — Hook question/statement
2. ProblemAgitationScene (5s) — Context/setup
3. OfferRevealScene (14s) — The reveal
4. CTAEndCard (8s) — CTA

**Best for:** Music Theory Secrets chord reveals, FundingReady grant alerts, Colvin Enterprises "AI secret"

---

### hook_teaching_45
**Name:** Hook + Teaching (45 seconds)
**Use case:** Educational explainer, piano lesson, how-to, step breakdown
**Duration:** 45 seconds
**Format:** 9:16
**Component structure:**
1. HeroHookScene (3s)
2. ProblemAgitationScene (5s)
3. StepByStepScene × 2-3 (20s total)
4. ProofPointScene (7s)
5. CTAEndCard (10s)

**Best for:** Music Theory Secrets lessons, Colvin Enterprises workflow demos

---

### transformation_60
**Name:** Transformation Story (60 seconds)
**Use case:** Before/after story, homebuyer journey, business result story
**Duration:** 60 seconds
**Format:** 9:16
**Component structure:**
1. HeroHookScene (5s)
2. ProblemAgitationScene (10s) — "Before" state
3. StepByStepScene × 2 (15s) — How it happened
4. TestimonialStyleScene (15s) — The transformation
5. OfferRevealScene (10s) — How to do the same
6. CTAEndCard (5s)

**Best for:** First Keys Indy homebuyer stories, Music Theory Secrets student transformations

---

### offer_reveal_30
**Name:** Offer Reveal (30 seconds)
**Use case:** Product promo, book announcement, consulting offer, service announcement
**Duration:** 30 seconds
**Format:** 9:16
**Component structure:**
1. HeroHookScene (3s)
2. OfferRevealScene (15s)
3. ProofPointScene (7s)
4. CTAEndCard (5s)

**Best for:** Music Theory Secrets book promos, Colvin Enterprises consulting offer

---

### slideshow_music_45
**Name:** Music Lesson Slideshow (45 seconds)
**Use case:** Piano chord slideshow, music theory series, step-by-step piano lesson
**Duration:** 45 seconds
**Format:** 9:16
**Component structure:**
1. AnimatedText cover (3s) — Series title
2. ImageSlideshowScene × 4-5 slides (35s)
3. CTAEndCard (7s)

**Best for:** Music Theory Secrets "5 chords" series, piano tutorial series

---

### local_awareness_30
**Name:** Local Awareness (30 seconds)
**Use case:** Community announcement, local service awareness, county-specific content
**Duration:** 30 seconds
**Format:** 1:1 or 9:16
**Component structure:**
1. HeroHookScene (5s) — "Attention [City/County] residents"
2. DataCardScene (10s) — Key local fact
3. OfferRevealScene (10s) — How to help/act
4. CTAEndCard (5s)

**Best for:** Indiana Backflow Directory county campaigns, First Keys Indy Marion County posts

---

### announcement_15
**Name:** Quick Announcement (15 seconds)
**Use case:** Time-sensitive announcement, grant deadline, event, breaking update
**Duration:** 15 seconds
**Format:** 9:16 or 1:1
**Component structure:**
1. HeroHookScene (3s) — Bold announcement
2. DataCardScene or AnimatedText (8s) — Key details
3. CTAEndCard (4s)

**Best for:** FundingReady Indiana grant deadlines, First Keys Indy program updates

---

### faith_story_60
**Name:** Faith Story (60 seconds)
**Use case:** Faith-inspired narrative, biblical character story, testimony-style content
**Duration:** 60 seconds
**Format:** 9:16
**Component structure:**
1. HeroHookScene (5s) — Epic opening
2. TestimonialStyleScene (15s) — Setup the story
3. StepByStepScene × 2 (20s) — Story development
4. ProofPointScene (10s) — Meaningful outcome
5. CTAEndCard (10s)

**Best for:** GloryEngine / Yahweh Comics content

---

## Template Selection Guide

| Need | Template |
|------|---------|
| Introduce a concept quickly | hook_reveal_30 |
| Teach something step by step | hook_teaching_45 |
| Tell a transformation story | transformation_60 |
| Promote a product/offer | offer_reveal_30 |
| Piano lesson series | slideshow_music_45 |
| Local community content | local_awareness_30 |
| Time-sensitive alert | announcement_15 |
| Faith/story content | faith_story_60 |

---

## Adding New Templates

New templates can be created by the Remotion Template Agent when:
- An existing template doesn't fit a specific campaign need
- A new video type is added to Alfred's content mix
- Alfred provides feedback that a template structure isn't working

New templates are marked `status: untested` until Alfred approves a video using them.
