# Remotion Render Test Plan — Colvin Content OS

Tests for the Remotion render pipeline from schema validation to render QA.

---

## Test 1: Schema Validation Test

**File:** `tests/remotion/schema-validation.test.ts`

**Purpose:** Verify that the remotion_video.schema.json correctly validates blueprints.

**Test cases:**
- Valid blueprint with all required fields → passes validation
- Blueprint with `approval_required: false` → fails (schema enforces `true`)
- Blueprint with invalid `platform` value → fails
- Blueprint with scene duration sum mismatch (> 2s off from total) → warn
- Blueprint with `render_status: 'rendered'` on creation → should only be set to 'draft' initially
- Blueprint missing `hook` field → fails
- Blueprint with `claims_check.risk_level` not in enum → fails
- Blueprint with empty `scenes` array → fails (minItems: 1)

---

## Test 2: Component Spec Test

**File:** `tests/remotion/component-spec.test.ts`

**Purpose:** Verify all component names in REMOTION_COMPONENT_SPEC.md are valid enum values in the schema.

**Test cases:**
```typescript
const validComponents = [
  'HeroHookScene', 'ProblemAgitationScene', 'ProofPointScene',
  'OfferRevealScene', 'StepByStepScene', 'TestimonialStyleScene',
  'CTAEndCard', 'CaptionLayer', 'ProgressBar', 'AnimatedText',
  'LogoIntro', 'LowerThird', 'ImageSlideshowScene', 'DataCardScene'
];

validComponents.forEach(component => {
  test(`${component} is a valid scene component`, () => {
    // Validate a scene with this component against the schema
    const scene = { ...validSceneFixture, component };
    expect(validateScene(scene)).toBe(true);
  });
});
```

---

## Test 3: Render Trigger Test (with Test Composition)

**File:** `tests/remotion/render-trigger.test.ts`
**Prerequisites:** Remotion MCP must be running and configured

**Purpose:** Verify the render trigger integration works.

**Test cases:**
- POST a test blueprint to Remotion MCP
- Receive render job ID in response
- Poll for render status (with timeout)
- Verify render completes within 10 minutes
- Verify output file URL is returned

**Note:** This test requires REMOTION_MCP_URL to be set and Remotion to have a test composition. It should only run in a properly configured environment.

---

## Test 4: QA Checklist Validation Test

**File:** `tests/remotion/qa-checklist.test.ts`

**Purpose:** Verify the QA checklist logic correctly identifies pass/fail conditions.

**Test cases:**
- Valid rendered video metadata → 25/25 checks pass
- Missing CTA end card → CTA check fails, severity: high
- Duration mismatch > 2s → duration check fails, severity: medium
- Caption timing off by > 1s → caption check flags as warning
- Girls Got Game video with youth-unsafe claim → compliance check fails
- First Keys Indy video missing HUD check → compliance check warns

---

## Running Remotion Tests

```bash
# Schema and spec tests (no external dependencies)
npm run test:remotion:unit

# Full pipeline tests (requires Remotion MCP)
REMOTION_MCP_URL=http://localhost:3001 npm run test:remotion:integration

# All remotion tests
npm run test:remotion
```

---

## Test Fixtures

Fixtures directory: `tests/fixtures/remotion/`
- `valid-blueprint.json` — complete valid blueprint
- `invalid-no-cta.json` — blueprint missing CTAEndCard
- `first-keys-blueprint.json` — First Keys Indy blueprint with HUD compliance
- `girls-got-game-blueprint.json` — youth-safe blueprint

---

## Integration Status

PLANNED — Phase 5. Requires test fixtures and Remotion MCP test composition.
