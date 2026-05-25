# Remotion Scene Planner — Colvin Content OS

Break a video concept into scenes. Define scene timing. Plan visual flow. Output a structured scene plan for the Remotion Video Agent.

---

## Scene Planning Principles

1. **Every second counts.** There are no filler scenes.
2. **One idea per scene.** Each scene makes one point, shows one thing, delivers one emotion.
3. **Hook dominates the first 3 seconds.** If the first scene isn't compelling, nothing else matters.
4. **CTA at the end is clear and singular.** One action. Not three options.
5. **Visual progression.** Each scene should feel like a natural next step from the previous.

---

## Scene Durations by Video Length

| Total Duration | Scenes | Typical Structure |
|---------------|--------|------------------|
| 15 seconds | 3-4 | Hook(3) → Value(8) → CTA(4) |
| 30 seconds | 4-6 | Hook(3) → Setup(5) → Value(15) → CTA(7) |
| 45 seconds | 5-8 | Hook(3) → Problem(5) → Value(25) → Proof(7) → CTA(5) |
| 60 seconds | 6-10 | Hook(3) → Problem(7) → Value(30) → Proof(10) → CTA(10) |
| 90 seconds | 8-12 | Hook(5) → Setup(10) → Value(45) → Proof(15) → CTA(15) |

---

## Scene Type Descriptions

### Hook Scene (Always Scene 1)
- Duration: 2-5 seconds
- Component: `HeroHookScene`
- Purpose: Create immediate curiosity, state the hook
- Visual: Bold text, strong visual, immediate impact
- On-screen text: The hook statement (max 10 words)
- Motion: Zoom in or slide up for energy

### Problem/Setup Scene
- Duration: 3-8 seconds
- Component: `ProblemAgitationScene`
- Purpose: Name the pain or setup the contrast
- Visual: Relatable visual or text on dark background
- On-screen text: The problem (max 15 words)

### Value/Teaching Scene(s)
- Duration: varies
- Component: `StepByStepScene` or `AnimatedText` or `ImageSlideshowScene`
- Purpose: Deliver the promised value
- For music: show the chord, the fingering, the theory
- For business: show the workflow, the result, the steps
- For housing: show the process, the numbers (with source), the steps

### Proof/Social Proof Scene
- Duration: 5-10 seconds
- Component: `ProofPointScene` or `TestimonialStyleScene`
- Purpose: Build credibility — results, data, or story
- Compliance note: Any statistics require source citation

### CTA End Card
- Duration: 5-10 seconds
- Component: `CTAEndCard`
- Purpose: Tell viewer exactly what to do next
- On-screen text: CTA text (max 8 words)
- Include: Brand logo, lane-appropriate styling

---

## Scene Plan Output Format

```json
{
  "total_scenes": 6,
  "total_duration_seconds": 45,
  "scene_plan": [
    {
      "scene_number": 1,
      "type": "hook",
      "duration_seconds": 3,
      "component": "HeroHookScene",
      "concept": "Bold text: 'You've been playing this chord wrong'",
      "motion": "zoom_in",
      "transition": "cut"
    },
    {
      "scene_number": 2,
      "type": "setup",
      "duration_seconds": 5,
      "component": "ProblemAgitationScene",
      "concept": "Show basic chord → contrast with gospel version",
      "motion": "slide_up",
      "transition": "fade"
    }
  ]
}
```

---

## Per-Lane Scene Style Preferences

| Lane | Visual Energy | Preferred Motion | Background Style |
|------|--------------|-----------------|-----------------|
| music_theory_secrets | High, dynamic | Quick cuts, zoom in/out | Dark with color accents |
| colvin_enterprises | Professional, clear | Smooth slides | Clean white or deep blue |
| first_keys_indy | Warm, welcoming | Gentle fades | Warm tones, community feel |
| funding_ready_indiana | Credible, informative | Clean slide in | Professional, green accent |
| glory_engine | Epic, dramatic | Dramatic reveals | Dark, gold accents |
