# Remotion Video QA Checklist — Colvin Content OS

Pre-render and post-render QA checklist. 25 items covering all quality dimensions.

---

## Pre-Render QA (Blueprint Review)

Run before Alfred approves the blueprint.

### Script and Content
- [ ] Hook is in the first 3 seconds of the video plan
- [ ] Hook creates curiosity or names a pain point (not a greeting)
- [ ] Voiceover script has been read aloud and flows naturally
- [ ] On-screen text per scene is 15 words or fewer
- [ ] CTA is clear, singular, and matches approved CTA for this lane
- [ ] No placeholder text ("INSERT TEXT HERE," "Lorem ipsum")
- [ ] All claims in script are either verified facts or marked as inferences

### Compliance
- [ ] claims_check.risk_level is accurate
- [ ] If `risk_level: high` — escalated to Alfred for pre-review
- [ ] First Keys Indy: no "guaranteed" or specific unverified dollar amounts
- [ ] Girls Got Game: youth-safe check passed
- [ ] All statistical claims have source attribution in script

### Format and Duration
- [ ] `format` matches the `platform` (9:16 for TikTok/Reels, etc.)
- [ ] `duration_seconds` matches sum of all scene durations
- [ ] Total duration is within platform guidelines (TikTok ≤60s, Shorts ≤60s)

### Assets
- [ ] Asset manifest is complete (no missing required assets)
- [ ] All assets have verified license status
- [ ] No copyrighted music specified
- [ ] Brand logo included in CTAEndCard scene

### Schema
- [ ] Blueprint validates against remotion_video.schema.json
- [ ] `approval_required: true` (always)
- [ ] `render_status: "draft"` on creation

---

## Post-Render QA (Rendered Video Review)

Run after Remotion MCP returns render complete.

### Technical
- [ ] Duration matches blueprint (±1 second)
- [ ] Resolution is correct for platform
- [ ] No black frames (except intentional fades)
- [ ] Frame rate is smooth (no stuttering or dropped frames)
- [ ] Audio is clear (if included) — no clipping

### Captions
- [ ] Captions appear on all scenes with voiceover
- [ ] Caption timing approximately matches speech
- [ ] Caption text matches voiceover script
- [ ] Caption font size is readable on mobile

### Visuals
- [ ] Hook scene appears in first 3 seconds
- [ ] All on-screen text is fully visible (not cut off at edges)
- [ ] Brand colors match lane specification
- [ ] Logo visible on CTA end card
- [ ] All scene transitions render correctly

### Content
- [ ] CTA is visible and readable at end
- [ ] Scene count matches blueprint
- [ ] No unintended content appeared (render artifacts, wrong assets)

---

## QA Scoring

**Pre-render:**
- All items PASS → proceed to Alfred approval queue
- Any item FAIL → fix blueprint before queuing

**Post-render:**
- 25/25 items PASS → deliver, notify Alfred
- 1-2 low-severity fails → flag in notification, Alfred decides to accept or re-render
- Any high-severity fail → block delivery, re-render required
- 3+ fails → block delivery, review blueprint for systematic errors
