# Remotion Render Smoke Test — Colvin Content OS

How to smoke test the Remotion render pipeline. Verifies MCP connection, composition listing, and a test render.

---

## npm Command

```bash
npm run test:remotion
```

---

## Prerequisites

- `REMOTION_MCP_URL` env var set (e.g., `http://localhost:3001`)
- Remotion MCP server running locally or accessible at that URL
- At least one composition registered in the Remotion project

---

## Individual Tests

### 1. MCP Server Reachability

```bash
# Test that Remotion MCP is reachable
curl -s "$REMOTION_MCP_URL/health" | jq '.status'
# Expected: "ok"
```

### 2. Composition Listing

```bash
# List available compositions
curl -s "$REMOTION_MCP_URL/compositions" | jq '.compositions | length'
# Expected: number > 0
```

```bash
# Verify specific composition exists
curl -s "$REMOTION_MCP_URL/compositions" \
  | jq '.compositions[] | select(.id == "HookReveal30") | .id'
# Expected: "HookReveal30"
```

### 3. Schema Validation Before Render

```bash
# Validate a test blueprint against the schema before triggering render
node -e "
const Ajv = require('ajv');
const ajv = new Ajv({ strict: false });
const schema = require('./agents/schemas/remotion_video.schema.json');
const testBlueprint = {
  video_id: 'smoke-test-001',
  campaign: { campaign_id: 'test', lane: 'music_theory_secrets', theme: 'chord reveal', goal: 'awareness' },
  platform: 'tiktok',
  duration_seconds: 30,
  format: '9:16',
  scenes: [{
    scene_number: 1,
    duration_seconds: 30,
    visual_description: 'Smoke test scene',
    on_screen_text: 'Test',
    caption_text: 'Test caption',
    component: 'HeroHookScene',
    motion_direction: 'up',
    transition: 'cut',
    asset_requirements: []
  }],
  voiceover_script: 'This is a smoke test.',
  captions: [],
  asset_manifest: [],
  brand_styles: { primary_color: '#1a1a2e', secondary_color: '#e94560', font_family: 'Inter', logo_placement: 'top-right' },
  claims_check: { risk_level: 'low', issues: [] },
  approval_required: true,
  render_status: 'approved',
  created_at: new Date().toISOString(),
  run_id: 'smoke-test-run-001',
  trace_id: 'smoke-test-trace-001',
  idempotency_key: 'music_theory_secrets_render_smoke_test_2026-01-01'
};
const valid = ajv.validate(schema, testBlueprint);
console.log(valid ? 'SCHEMA VALID' : 'SCHEMA INVALID: ' + JSON.stringify(ajv.errors, null, 2));
"
# Expected: SCHEMA VALID
```

### 4. Render Trigger (Dry Run)

```bash
# Trigger a render job with a minimal test blueprint
# Use dry_run: true to validate without actually rendering
curl -s -X POST "$REMOTION_MCP_URL/render" \
  -H "Content-Type: application/json" \
  -d '{
    "composition_id": "HookReveal30",
    "dry_run": true,
    "props": {
      "lane": "music_theory_secrets",
      "duration_seconds": 30
    }
  }' | jq '.accepted'
# Expected: true
```

### 5. Render Status Poll

```bash
# After triggering a real render, poll for status
# Replace RENDER_JOB_ID with actual job ID from render trigger response
RENDER_JOB_ID="test-job-123"

curl -s "$REMOTION_MCP_URL/renders/$RENDER_JOB_ID" | jq '.status'
# Expected: "queued" | "rendering" | "done" | "error"
```

---

## Full Remotion Smoke Script

```bash
#!/bin/bash
# scripts/remotion-render-smoke.sh

echo "Colvin Content OS — Remotion Render Smoke Tests"
echo "================================================"

PASS=0
FAIL=0
REMOTION_URL="${REMOTION_MCP_URL:-http://localhost:3001}"

check() {
  local name=$1
  local command=$2
  local expected=$3

  result=$(eval "$command" 2>/dev/null)
  if [ "$result" = "$expected" ]; then
    echo "✓ $name"
    PASS=$((PASS+1))
  else
    echo "✗ $name (got: $result, expected: $expected)"
    FAIL=$((FAIL+1))
  fi
}

# 1. MCP Reachability
check "Remotion MCP reachable" \
  "curl -s '$REMOTION_URL/health' | jq -r '.status'" \
  "ok"

# 2. Compositions available
COMP_COUNT=$(curl -s "$REMOTION_URL/compositions" 2>/dev/null | jq '.compositions | length' 2>/dev/null)
if [ "$COMP_COUNT" -gt 0 ] 2>/dev/null; then
  echo "✓ Compositions available ($COMP_COUNT found)"
  PASS=$((PASS+1))
else
  echo "✗ Compositions — none found or MCP unreachable"
  FAIL=$((FAIL+1))
fi

# 3. Schema file exists
check "remotion_video.schema.json exists" \
  "test -f './agents/schemas/remotion_video.schema.json' && echo 'found'" \
  "found"

# 4. Dry-run render accepted
DRY_RUN_RESULT=$(curl -s -X POST "$REMOTION_URL/render" \
  -H "Content-Type: application/json" \
  -d '{"composition_id":"HookReveal30","dry_run":true,"props":{"lane":"music_theory_secrets"}}' \
  2>/dev/null | jq -r '.accepted' 2>/dev/null)

if [ "$DRY_RUN_RESULT" = "true" ]; then
  echo "✓ Dry-run render accepted"
  PASS=$((PASS+1))
else
  echo "✗ Dry-run render — not accepted (got: $DRY_RUN_RESULT)"
  FAIL=$((FAIL+1))
fi

echo "================================================"
echo "$PASS passed, $FAIL failed"

if [ "$FAIL" -gt 0 ]; then
  echo ""
  echo "Troubleshooting:"
  echo "  1. Is Remotion MCP running? Check: ps aux | grep remotion"
  echo "  2. Is REMOTION_MCP_URL set? Current: $REMOTION_URL"
  echo "  3. See REMOTION_RENDER_PIPELINE.md for setup instructions"
fi

exit $FAIL
```

---

## Expected Composition IDs

These compositions should be registered in the Remotion project:

| Composition ID | Duration | Format | Template |
|---------------|----------|--------|----------|
| HookReveal30 | 30s | 9:16 | hook_reveal_30 |
| HookTeaching45 | 45s | 9:16 | hook_teaching_45 |
| Transformation60 | 60s | 9:16 | transformation_60 |
| OfferReveal30 | 30s | 9:16 | offer_reveal_30 |
| SlideshowMusic45 | 45s | 9:16 | slideshow_music_45 |
| LocalAwareness30 | 30s | 9:16 | local_awareness_30 |
| Announcement15 | 15s | 9:16 | announcement_15 |
| FaithStory60 | 60s | 9:16 | faith_story_60 |

---

## When to Run

- After initial Remotion MCP setup
- After updating Remotion MCP URL
- When `REMOTION_MCP_URL` env var changes
- Before triggering any production render
- As part of SYSTEM_HEALTH_CHECK_AGENT

---

## Integration Status

REQUIRES SETUP — Remotion MCP must be running. Set `REMOTION_MCP_URL` in `.env.local`.
See `REMOTION_RENDER_PIPELINE.md` for full setup instructions.
