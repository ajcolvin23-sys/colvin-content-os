# Remotion Slideshow Video Playbook — Colvin Content OS

Playbook for slideshow-style videos. Music Theory Secrets piano lessons, book page reveals, step-by-step tutorial slides, FundingReady facts, grant announcements.

---

## When to Use Slideshow Format

Slideshow videos are best when:
- Content has natural list structure (5 steps, 7 facts, 3 chords)
- Each slide can stand alone as a complete thought
- The value is in the information density, not the performance
- Audience is willing to slow down and read (Facebook, LinkedIn, YouTube)

Use short-form video (REMOTION_SHORT_FORM_VIDEO_PLAYBOOK.md) instead when:
- Primary platform is TikTok (fast scroll — slides feel slow)
- Content requires demonstration (showing a chord, showing a result)
- Hook needs visual energy (movement, zoom, reveal)

---

## Slideshow Structure

### Music Theory Secrets: Piano Lesson Slide Format

```
Slide 1 (Cover): Title card
  - Bold title: "5 Gospel Chord Voicings Every Worship Pianist Needs"
  - Subtitle: "Music Theory Secrets"
  - Duration: 3 seconds

Slide 2-6 (Content slides):
  - Slide number (e.g., "1 of 5")
  - Chord name: "Dominant 7th Flat 9"
  - Visual: Chord diagram or notation
  - Description: 1-2 sentences explaining the sound and use
  - Duration: 6-8 seconds each

Slide 7 (CTA): 
  - "Get all the voicings in Music Theory Secrets"
  - Book cover image
  - URL or "link in bio"
  - Duration: 5 seconds
```

Total: ~45-60 seconds for 5-chord slideshow

### Book Page Reveal Format

```
Slide 1 (Hook): "Here's what's inside Music Theory Secrets"
Slide 2-5: Show actual book pages (approved by Alfred)
Slide 6: Testimonial or key benefit
Slide 7: CTA with price and purchase link
Duration: 30-45 seconds
```

### Step-by-Step Tutorial Slides

```
Slide 1: Hook ("The 3 steps to book your first homebuyer consultation in Marion County")
Slides 2-4: One step per slide (numbered, clear action)
Slide 5: Summary of all steps
Slide 6: CTA ("Check your eligibility at [URL]")
Duration: 30-45 seconds
```

### FundingReady Indiana: Grant Announcement

```
Slide 1: "NEW: Indiana Grant Alert" (bold, attention-grabbing)
Slide 2: Grant name + amount
Slide 3: Who qualifies
Slide 4: Deadline
Slide 5: "Get the free grant checklist + apply guide"
Duration: 20-30 seconds
```

---

## Remotion Components for Slideshow

Primary component: `ImageSlideshowScene`
Supporting: `DataCardScene` (for facts/stats), `AnimatedText` (for emphasis), `CTAEndCard`

Each slide transitions via:
- `slide_left` — for sequential content
- `fade` — for softer transitions
- `cut` — for punchy, energetic content (music lane)

---

## Music and Pacing

For music slideshows:
- Background music: gentle, gospel-adjacent, instrumental
- Pacing: 5-8 seconds per slide gives viewers time to absorb
- Never use copyrighted music (use YouTube Audio Library or Pixabay)

For business/grant slideshows:
- Background music: optional, professional/neutral if used
- Pacing: 4-6 seconds per slide
- Music should not compete with on-screen text reading speed

---

## Accessibility

- Minimum font size: 36px for primary text (viewed on mobile)
- High contrast: white text on dark, dark text on light
- All text must be readable without needing to pause
- Never more than 30 words per slide
