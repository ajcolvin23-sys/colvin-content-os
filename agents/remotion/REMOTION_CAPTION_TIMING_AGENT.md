# Remotion Caption Timing Agent — Colvin Content OS

Generate caption timing data for every video. Word-by-word timing. Caption groupings. Accessibility compliance.

---

## Purpose

Captions are not optional. They are:
1. Required for accessibility (ADA-aligned, best practice)
2. Critical for TikTok/Instagram/Facebook where 85%+ of viewers watch without sound
3. Part of the Remotion `CaptionLayer` component on every video

---

## Caption Timing Process

```
1. Receive voiceover script + scene durations
2. Estimate speaking timestamps:
   - Calculate average speaking rate: 150 WPM default
   - Adjust for scene-by-scene pacing (some scenes are slower/faster)
   - Account for pauses between scenes
3. Assign word-by-word timestamps
4. Group words into caption chunks:
   - 2-4 words per caption display group
   - Never cut a meaningful phrase mid-group
5. Format as caption timing JSON array
6. Assign to correct scene in video blueprint
```

---

## Caption Timing Format

```json
{
  "captions": [
    {
      "scene_number": 1,
      "text": "YOU'VE BEEN",
      "start_seconds": 0.0,
      "end_seconds": 0.6
    },
    {
      "scene_number": 1,
      "text": "PLAYING THIS CHORD",
      "start_seconds": 0.6,
      "end_seconds": 1.4
    },
    {
      "scene_number": 1,
      "text": "WITHOUT KNOWING WHY",
      "start_seconds": 1.4,
      "end_seconds": 2.5
    }
  ]
}
```

---

## Caption Grouping Rules

**Good grouping:**
- "YOU'VE BEEN" / "PLAYING THIS" / "CHORD FOR YEARS"

**Bad grouping (splits meaning):**
- "YOU'VE BEEN PLAYING" / "THIS" / "CHORD FOR YEARS"
- Always keep: prepositional phrases together, verb + direct object together

---

## Caption Style by Platform

| Platform | Case | Size | Color | Background |
|----------|------|------|-------|-----------|
| TikTok | ALL CAPS or Title Case | Large | White | Semi-transparent black box |
| YouTube Shorts | Title Case | Medium | White | Auto-generated or styled |
| Instagram Reels | Title Case | Large | White | Optional shadow |
| LinkedIn | Title Case | Medium | White | Dark overlay |
| Facebook | Title Case | Medium | White | Dark overlay |

---

## Accessibility Compliance

- Minimum font size: 24px equivalent (readable at mobile size)
- Minimum contrast ratio: 4.5:1 (WCAG AA)
- Caption display duration: minimum 0.5 seconds per group
- No more than 4 words per caption group (reading speed consideration)

---

## When TTS Is Available

If a Text-to-Speech integration is configured (future):
- Actual audio file provides exact timing data
- Caption timing is extracted from audio alignment
- This eliminates estimated timing — use actual timestamps when available

For now: all timing is estimated based on script word count and target duration.
