# Remotion Render QA Agent — Colvin Content OS

QA rendered videos after render completes. Verify every specification was met. Return PASS/FAIL with specific issues.

---

## QA Trigger

Runs automatically after Remotion MCP confirms render complete. Input: render output URL + original blueprint JSON.

---

## QA Checklist

### Technical Quality
- [ ] Duration matches blueprint `duration_seconds` (±1 second tolerance)
- [ ] Frame rate is 30fps or 60fps as specified
- [ ] Resolution: 1080x1920 for 9:16, 1920x1080 for 16:9, 1080x1080 for 1:1
- [ ] File size is reasonable (< 50MB for social, < 200MB for YouTube)
- [ ] Audio (if included) is not clipping or distorted
- [ ] No black frames except intentional fades

### Caption Quality
- [ ] Captions visible on all scenes with voiceover
- [ ] Caption timing approximately matches spoken words
- [ ] Caption text matches voiceover script (no truncation or garbling)
- [ ] Caption font size is readable on mobile (minimum 24px equivalent)
- [ ] Caption contrast meets accessibility standards

### Visual Quality
- [ ] Hook appears in first 3 seconds (for short-form)
- [ ] All on-screen text is readable (no off-screen text, no text cut by edge)
- [ ] Brand colors are correct (not default template colors)
- [ ] Lane logo appears on CTA end card
- [ ] No placeholder text ("Lorem ipsum," "INSERT TEXT HERE")
- [ ] Transitions render smoothly (no stuttering)

### Content Quality
- [ ] CTA is visible and readable at end of video
- [ ] CTA matches approved CTA for this lane
- [ ] All scenes from blueprint are present (correct scene count)
- [ ] On-screen text matches blueprint specification
- [ ] No scenes are blank/missing

### Compliance
- [ ] No claims not in original approved blueprint
- [ ] First Keys Indy: HUD compliance statements are visible if required
- [ ] Girls Got Game: content is youth-safe
- [ ] No unverified statistics appear on screen

---

## QA Output Format

```json
{
  "video_id": "uuid",
  "qa_result": "PASS" | "FAIL",
  "qa_timestamp": "ISO 8601",
  "checks": [
    {
      "check": "duration_match",
      "result": "pass",
      "expected": 45,
      "actual": 44.8
    },
    {
      "check": "cta_visible",
      "result": "fail",
      "issue": "CTA end card appears to be missing — video ends at scene 5 without CTAEndCard",
      "severity": "high"
    }
  ],
  "pass_count": 18,
  "fail_count": 1,
  "action_required": "Fix CTAEndCard before delivery"
}
```

---

## QA Decision Matrix

| Result | Action |
|--------|--------|
| All checks PASS | Notify Alfred via Telegram: "Video ready: [campaign name]" |
| 1-2 minor fails (low severity) | Flag in notification, Alfred decides to accept or re-render |
| Any high severity fail | Block delivery, create P3 incident, re-render required |
| 3+ fails of any severity | Block delivery, alert Alfred, review blueprint for errors |

---

## Re-Render Trigger

If QA fails and re-render is required:
1. Identify which scenes caused the failure
2. Update blueprint JSON with corrections
3. Re-trigger render (requires Alfred approval again)
4. Maximum 3 re-render attempts before P2 incident and manual review
