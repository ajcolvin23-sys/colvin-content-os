---
file: LOCKED_UPGRADES.md
role: Permanent upgrade registry — never revert, never override
load: Every session, before any video or content task
---

# GABRIEL — LOCKED UPGRADES

This file records every confirmed system upgrade Alfred has approved.
These are permanent. Nothing in this file can be undone by a new prompt, new session, or code regeneration.
If any code change would revert a locked upgrade, STOP and flag it to Alfred first.

---

## UPGRADE 001 — ChatGPT (DALL-E 3) Images in Every Video
**Locked:** 2026-05-26
**Status:** ✅ LIVE

### What changed
- Every video scene with an `assets[]` entry gets a real DALL-E 3 cinematic image before rendering
- Falls back to Pexels if `OPENAI_API_KEY` is missing or generation fails
- `fetch-assets.ts` must ALWAYS run before Remotion renders — this is wired into `render-video-json.ts`
- `render-daily.ts` also runs `fetch-assets` before each render

### Locked behavior
- `render:json` ALWAYS calls `fetch-assets.ts` first if any scene has unresolved image descriptions
- Never render a video without attempting image fetch first
- Never remove the `assets[]` array from scene JSON

### Lane-specific cinematic prompts locked in `fetch-assets.ts`
| Lane | Problem mood | Solution mood |
|---|---|---|
| first_keys_indy | Cold blue, exhausted Black woman in apartment | Warm golden, joyful Black family with house keys |
| colvin_enterprises | Dark office, exhausted businessman at desk | Bright modern office, confident relaxed entrepreneur |
| music_theory_secrets | Frustrated musician, dark room | Joyful musician playing freely |
| indiana_backflow | Stressed homeowner with water damage | Relief, professional resolving the problem |

---

## UPGRADE 002 — Brave Search Gzip Decompression Fix
**Locked:** 2026-05-27
**Status:** ✅ LIVE

### What changed
- Brave Search API always returns gzip-compressed responses
- Old code tried to `JSON.parse()` raw compressed bytes → always threw → 0 leads
- Fixed: `callBraveSearch` now decompresses with `zlib.gunzip()` before parsing
- `import * as zlib from 'zlib'` is required in `gabriel-daily-run.ts`

### Locked behavior
- Never remove the zlib decompression step from `callBraveSearch`
- Always check `res.headers['content-encoding']` before parsing

---

## UPGRADE 003 — Firecrawl Credit Depletion Detection
**Locked:** 2026-05-27
**Status:** ✅ LIVE

### What changed
- When Firecrawl credits run out (402 response), old code silently returned `[]` and health check showed ✅
- Fixed: `firecrawlCreditsDepleted` module-level flag; once set, all Firecrawl calls skip immediately
- Health check shows `⚠️ warn` with upgrade URL when credits are depleted

### Locked behavior
- Never remove the 402 detection from `callFirecrawlScrape` or `callFirecrawlSearch`
- Never show ✅ for Firecrawl when credits are gone — always show `⚠️ warn`

---

## UPGRADE 004 — LinkedIn JSON.parse Crash Protection
**Locked:** 2026-05-27
**Status:** ✅ LIVE

### What changed
- Step 5 LinkedIn content gen had an unprotected `JSON.parse()` call
- If GPT returned non-JSON, entire step5 crashed and all lanes lost content
- Fixed: wrapped in try/catch — bad JSON logs a visible error and skips that lane only

### Locked behavior
- All GPT `JSON.parse()` calls in step5 must be wrapped in try/catch
- A single lane's JSON parse failure must never crash other lanes
- Facebook and TikTok sections already have this protection — LinkedIn now matches

---

## UPGRADE 005 — override_content in /api/generate
**Locked:** 2026-05-27
**Status:** ✅ LIVE

### What changed
- Create page sends `override_content` when user selects a variant to save
- Old Zod schema stripped `override_content` → API regenerated fresh content instead
- Fixed: `override_content` added to `ContentSchema`; when present, skips `generateContent()` and saves directly

### Locked behavior
- `override_content` must always be in `ContentSchema` in `/api/generate/route.ts`
- When `override_content` is present + `save_to_db: true`, skip AI generation entirely
- `generation_model` is recorded as `'override'` for auditability

---

## UPGRADE 006 — Silent Database Save Failure Fix
**Locked:** 2026-05-27
**Status:** ✅ LIVE

### What changed
- When Supabase insert failed, `/api/generate` returned 200 with no `content_item_id`
- UI showed "saved" but nothing was in the database
- Fixed: returns 500 with `{ error: 'Failed to save to database' }` when insert fails

### Locked behavior
- Never return 200 when a Supabase insert fails with `save_to_db: true`
- Always check `insertErr` and `inserted` — if either is bad, return 500

---

## UPGRADE 007 — render:json Format Arg Bug Fix
**Locked:** 2026-05-27
**Status:** ✅ LIVE

### What changed
- `args.indexOf('--format')` returns -1 when flag not passed
- `-1 + 1 = 0` → `args[0]` (the JSON filename) was used as the format
- `compositionId` became `undefined` → render failed with "composition not found"
- Fixed: only read `args[formatFlagIdx + 1]` when `formatFlagIdx >= 0`

### Locked behavior
- `render:json` must always correctly resolve to `9:16` / `1:1` / `16:9` when `--format` is not passed
- Default format is `9:16` (vertical TikTok/Reels)

---

## UPGRADE 008 — Katrina Compliance Gate
**Locked:** 2026-05-27
**Status:** ✅ LIVE

### Gated lanes (always `needs_review`, never auto-approved)
- `first_keys_indy`
- `funding_ready_indiana`
- `girls_got_game`

### Locked behavior
- Content from gated lanes must always enter `needs_review` status
- Never set gated lane content to `draft` or `approved` automatically
- `compliance_notice` must always be returned in the API response for gated lanes
- OutreachActions must block approve/reject on gated drafts until `katrina_review_required` is cleared

---

## UPGRADE 009 — Thinking Protocol: Free Intelligence + Trigger-Based Skill Loading
**Locked:** 2026-05-27
**Status:** ✅ LIVE

### What changed
- Old pattern: Load all skills upfront → follow structured template → constrained output
- New pattern: Free thinking first → trigger scan → surgical skill invoke → locked rules last
- `THINKING_PROTOCOL.md` defines the 4-phase pattern
- `TRIGGER_MAP.md` is the quick-reference scan list for Phase 2
- Skills are now guardrails that fire on demand, not cages applied upfront

### Locked behavior
- Phase 1 (free thinking) always runs first — never skip it to load a skill immediately unless the task explicitly names a template
- Phase 2 (trigger scan) always runs against `TRIGGER_MAP.md` after generating
- Phase 3 (skill invoke) is surgical — only the flagged section gets corrected
- Phase 4 (locked rules) always applies regardless of trigger results
- If 5+ triggers fire, regenerate Phase 1 — don't patch a low-quality output
- ALWAYS-ON triggers (Katrina gate, DB save, image fetch) apply to every output without scanning

---

## UPGRADE 010 — CinematicAd System: Full 6-Scene Remotion Engine
**Locked:** 2026-05-27
**Status:** ✅ LIVE

### What changed
Complete rebuild of the Remotion VideoEngine for emotionally compelling, direct-response short-form ads.

#### New scene types
| Type | Component | Purpose |
|---|---|---|
| `pain_stack` | `PainStackScene` | 2–3 pain points spring in sequentially, red accent marks, "Sound familiar?" label |
| `desire` | `DesireScene` | Pull-back motion, warm grade, aspirational headline, "Picture this →" label |
| `mechanism` | `MechanismScene` | 3-step glassmorphism cards spring in from right, numbered badges |
| `transformation` | `TransformationScene` | Before/after cards with divider reveal, warm triumphant grade |

#### New shared components
| Component | Purpose |
|---|---|
| `KineticHeadline` | Word-by-word spring reveal, accent color emphasis, glow |
| `LightSweep` | Cinematic lens-flare gradient sweep on scene open |
| `CinematicGrain` | SVG feTurbulence animated film grain (opacity 0.035) |
| `GlobalProgressBar` | Thin accent-colored progress bar composited above all scenes |
| `SafeZone` | 9:16 mobile safe margins — top:120, bottom:240, sides:56 |

#### Scene routing rule (SceneRenderer.tsx)
- `pain_stack`, `desire`, `mechanism`, `transformation`, `cta` → always their dedicated component (handle images internally)
- Generic types (`hook`, `problem`, `solution`, `proof`) with resolved image → `ImageOverlayScene`
- Generic types without image → original brand-color component

#### VideoEngine global overlays
- `CinematicGrain` and `GlobalProgressBar` are composited above ALL scenes in `VideoEngine.tsx`
- Never remove these from `VideoEngine.tsx`

#### ImageOverlayScene upgrades
- 6 motion modes: `push_in`, `pull_back`, `drift_left`, `drift_right`, `pan_up`, `pan_down`
- Color grade system: `cold`, `warm`, `dramatic`, `neutral`, `none`
- Auto mood detection: problem scene types → cold, solution types → warm
- Overlay intensity: `light` (15%) / `medium` (32%) / `heavy` (55%)
- KineticHeadline + LightSweep on every image scene

#### CTAScene upgrades
- Full AI image background support (handles image internally)
- KineticHeadline word-by-word reveal
- Pulsing CTA button — `Math.sin` breathing loop + glow intensity animation
- LightSweep entrance + brand glow at top

#### fetch-assets.ts upgrades
- `pain_stack` added to `PROBLEM_SCENE_TYPES` (cold imagery)
- `SCENE_TYPE_OVERRIDES` added: per-lane, per-scene-type prompts for `desire`, `transformation`, `mechanism`, `cta`
- Type-specific overrides checked before generic emotional state pool

#### 31-second 6-scene structure (canonical)
| # | Type | Duration | Mood |
|---|---|---|---|
| 1 | `hook` | 4s | Cold push-in — pattern interrupt |
| 2 | `pain_stack` | 5s | Cold — tension build |
| 3 | `desire` | 5s | Warm pull-back — hope shift |
| 4 | `mechanism` | 6s | Warm — solution clarity |
| 5 | `transformation` | 5s | Warm — before/after payoff |
| 6 | `cta` | 6s | Warm — pulsing CTA |

#### Brand video configs locked in
- `videos/colvin-enterprises-cinematic-ad.json`
- `videos/first-keys-indy-cinematic-ad.json`
- `videos/music-theory-secrets-cinematic-ad.json`

### Locked behavior
- 6-scene structure is the canonical format for all direct-response ads
- Every new ad video Gabriel writes must follow: hook → pain_stack → desire → mechanism → transformation → cta
- Every scene must have an `assets[]` entry with a `description` for DALL-E 3
- Never render without `fetch-assets.ts` running first (enforced by `render-video-json.ts`)
- `SCENE_TYPE_OVERRIDES` in `fetch-assets.ts` must never be removed — it provides targeted emotional prompts
- `CinematicGrain` and `GlobalProgressBar` must stay in `VideoEngine.tsx` as global overlays

---

## HOW GABRIEL LOGS NEW MISTAKES

When Alfred identifies a failure or unexpected behavior:
1. Gabriel adds a new entry to the relevant `failure-log.md` in the skill folder
2. Gabriel adds a UPGRADE entry to THIS file with `Status: ✅ LIVE` after the fix is confirmed
3. The fix is wired into the correct script/route — never left as a manual workaround
4. Gabriel reads this file at the start of every session involving video or content

---

## WHAT NEVER CHANGES

These rules are non-negotiable across all upgrades:

- **No auto-publish.** Draft → Alfred approves → publish. Always.
- **No fake stats.** No fabricated client results. No invented ROI numbers.
- **No financial/legal/housing claims without compliance review.**
- **No scraping against site terms.**
- **No API keys in frontend code.**
- **No Supabase RLS bypass.**
- **Firecrawl 402 = warn, not success.**
- **Every video render = fetch-assets first.**
- **Every content save = check for DB error before returning 200.**
