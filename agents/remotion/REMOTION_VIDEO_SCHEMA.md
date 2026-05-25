# Remotion Video Schema Documentation — Colvin Content OS

Documentation of `/agents/schemas/remotion_video.schema.json`. Field definitions, allowed values, validation rules.

---

## Root Fields

| Field | Type | Required | Description |
|-------|------|---------|-------------|
| `video_id` | UUID string | Yes | Unique ID for this blueprint |
| `campaign` | string (max 200) | Yes | Campaign name |
| `lane` | enum | Yes | One of 9 business lanes |
| `platform` | enum | Yes | `tiktok\|youtube_shorts\|instagram_reels\|facebook_reels\|linkedin_video` |
| `duration_seconds` | integer 5-600 | Yes | Total video duration |
| `format` | enum | Yes | `"9:16"\|"1:1"\|"16:9"` |
| `audience` | string (max 500) | Yes | Target audience description |
| `goal` | enum | Yes | `awareness\|lead_generation\|conversion\|education\|community_building\|authority_building\|retargeting` |
| `hook` | string (max 300) | Yes | Opening hook concept |
| `voiceover_script` | string | Yes | Full voiceover script |
| `scenes` | array (1-30 items) | Yes | Scene objects array |
| `music_direction` | string (max 500) | Yes | Audio direction with license source |
| `thumbnail_concept` | string (max 500) | Yes | Thumbnail image description |
| `cta` | string (max 300) | Yes | Call to action text |
| `claims_check` | object | Yes | Compliance review |
| `approval_required` | boolean (always true) | Yes | Must always be `true` |
| `render_status` | enum | Yes | `draft\|approved\|rendering\|rendered\|failed` |

---

## Scene Object Fields

Each scene in the `scenes` array must include:

| Field | Type | Required | Description |
|-------|------|---------|-------------|
| `scene_number` | integer ≥1 | Yes | Scene sequence number |
| `duration_seconds` | number 0.5-120 | Yes | Scene duration |
| `visual_description` | string (max 1000) | Yes | What the viewer sees |
| `on_screen_text` | string\|null (max 500) | Yes | Text overlay on screen |
| `caption_text` | string\|null (max 500) | Yes | Subtitle text |
| `component` | enum | No | Remotion component name |
| `motion_direction` | enum\|null | No | `fade_in\|slide_left\|slide_right\|slide_up\|slide_down\|zoom_in\|zoom_out\|static` |
| `transition` | enum\|null | No | `cut\|fade\|slide\|wipe\|zoom` |
| `asset_requirements` | array | No | Assets needed for scene |
| `voiceover_segment` | string\|null | No | Portion of voiceover for this scene |

---

## claims_check Object

| Field | Type | Required | Description |
|-------|------|---------|-------------|
| `risk_level` | enum | Yes | `low\|medium\|high` |
| `issues` | array of string | Yes | List of specific issues (empty array if none) |
| `first_keys_indy_hud_check` | boolean\|null | No | Required if lane is `first_keys_indy` |

---

## Validation Rules

1. `duration_seconds` must equal the sum of all scene `duration_seconds` values (±2 second tolerance)
2. `format` must match the `platform`:
   - `tiktok`, `youtube_shorts`, `instagram_reels`, `facebook_reels` → must be `"9:16"`
   - `linkedin_video` → can be `"16:9"` or `"1:1"` or `"9:16"`
3. `approval_required` must always be `true` — schema enforces this with `enum: [true]`
4. `render_status` must be `"draft"` on creation — only Hermes updates this field
5. If `lane = "first_keys_indy"` and `claims_check.risk_level` is `"high"`: require `first_keys_indy_hud_check: true`
6. `scenes` must have at least 1 item and the last scene must have `component: "CTAEndCard"` (recommended, not hard-enforced)

---

## Status Lifecycle

```
draft (created by Remotion Video Agent)
  → approved (Alfred approves via review queue)
  → rendering (Remotion MCP triggered)
  → rendered (render complete)
  
OR:
  → failed (render failed)
  → (fix and re-trigger)
  → rendering again
```

---

## Schema Versioning

Current version: 1.0 (initial)
Schema ID: `https://colvin-content-os.vercel.app/schemas/remotion_video.schema.json`

Breaking changes require:
1. New schema version file
2. Data migration for existing blueprints
3. Alfred approval of schema change
