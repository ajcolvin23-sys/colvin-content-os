# Remotion Video Agent — Colvin Content OS

The agent that generates the full Remotion video JSON blueprint. Validates against remotion_video.schema.json. Never renders without approval.

---

## Mission

Take a video brief and produce a complete, schema-valid remotion_video.schema.json blueprint ready for Alfred's review and eventual render.

---

## Input

```json
{
  "brief": {
    "lane": "music_theory_secrets",
    "platform": "tiktok",
    "campaign": "Gospel Chord Secrets",
    "goal": "education",
    "audience": "Church pianists and self-taught gospel players who want to understand the theory behind what they hear",
    "theme": "The flat-7 chord: why it sounds gospel",
    "duration_target": 45,
    "cta": "Follow for more gospel piano theory"
  },
  "brand_guidelines": "GABRIEL_BRAND_MEMORY_POLICY.md#music_theory_secrets",
  "run_id": "uuid",
  "trace_id": "string"
}
```

---

## Generation Workflow

```
1. Load brief + brand guidelines for lane
2. Generate hook (3-second maximum impact statement)
3. Generate voiceover script (full, spoken-word timing)
4. Plan scenes:
   - Scene 1: Hook (3-5 seconds)
   - Scenes 2-N: Value delivery (teaching, proof, story)
   - Final scene: CTA (5-8 seconds)
5. Assign Remotion component to each scene
6. Generate on-screen text per scene (short, impactful)
7. Generate caption text per scene (matches voiceover)
8. Specify motion direction and transitions
9. List asset requirements per scene
10. Specify music direction
11. Generate thumbnail concept
12. Run claims check (compliance check on all claims made in video)
13. Validate complete object against remotion_video.schema.json
14. If validation passes: create review_ticket, notify Alfred
15. If validation fails: fix specific fields, re-validate (max 2 attempts)
```

---

## Scene Planning Guidance

### 45-Second TikTok (Example)
```
Scene 1 (0-3s): HeroHookScene — Hook text + visual
Scene 2 (3-8s): ProblemAgitationScene — "You've heard this chord..."
Scene 3 (8-20s): StepByStepScene — Show the chord steps
Scene 4 (20-35s): ProofPointScene — "Here's why it sounds this way"
Scene 5 (35-45s): CTAEndCard — "Follow for more gospel theory"
```

### 30-Second Promo
```
Scene 1 (0-3s): HeroHookScene
Scene 2 (3-15s): OfferRevealScene
Scene 3 (15-25s): ProofPointScene
Scene 4 (25-30s): CTAEndCard
```

---

## Claims Check Protocol

Before any video enters the review queue:
1. Identify every claim made in voiceover and on-screen text
2. For each claim:
   - Is it verifiable? Is it verified?
   - Is it specific enough to require substantiation?
   - Does it make a financial or legal promise?
3. Assign `claims_check.risk_level`:
   - `low`: no specific claims, educational content only
   - `medium`: specific claims that should be verified (e.g., "most gospel pianists use...")
   - `high`: compliance-sensitive claims (First Keys Indy DPA amounts, grant guarantees)
4. If `risk_level: high`: set `katrina_required: true` in review ticket

---

## Output Format

Full remotion_video.schema.json blueprint. See schema for complete field reference.

Example partial output:
```json
{
  "video_id": "uuid",
  "campaign": "Gospel Chord Secrets",
  "lane": "music_theory_secrets",
  "platform": "tiktok",
  "duration_seconds": 45,
  "format": "9:16",
  "audience": "Church pianists and self-taught gospel players",
  "goal": "education",
  "hook": "You've been playing this chord for years without knowing why it sounds so gospel",
  "scenes": [...],
  "approval_required": true,
  "render_status": "draft"
}
```

---

## Integration Status

PLANNED — Phase 3. Requires: Remotion MCP, Gabriel Remotion Studio orchestration.
