# Weekly Optimization Workflow — Colvin Content OS

Friday self-audit. Review week's performance. Identify top 3 improvements. Generate SIP (System Improvement Proposals). Hermes reviews and applies low-risk patches.

---

## Trigger

Every Monday at 9 AM ET (beginning of week review): `0 9 * * 1`
Also: Every Friday at 5 PM ET (end of week summary): `0 17 * * 5`

---

## Monday Review (Week Planning)

```
Stage 1: Last Week Performance Review
  - How many leads found vs target?
  - How many outreach drafts approved vs generated?
  - How many content pieces published vs created?
  - Any incidents from last week? Resolved?
  - Review queue: average review time? Rejections? Feedback patterns?

Stage 2: Content Calendar Review
  - Which platforms were underserved last week?
  - Which lanes have been quiet?
  - Upcoming events or timing opportunities this week?

Stage 3: This Week's Plan
  - Set targets for each lane
  - Identify any special campaigns or content themes
  - Note any Alfred feedback from last week's approvals

Stage 4: Alfred Briefing
  - Telegram: "Week planning brief ready. 3 recommendations for this week."
```

---

## Friday Self-Audit (12 Areas)

```
1. Lead Quality: Are scores and fit_reasons accurate?
2. Outreach Personalization: Do drafts sound like Alfred?
3. Content Volume: Meeting targets per lane per platform?
4. Content Quality: Any rejected content patterns? Why?
5. Video Pipeline: Blueprints created vs approved vs rendered — any blockages?
6. Compliance: Any flags that nearly became blocks? Pattern of risk?
7. System Health: Any recurring errors? Provider reliability?
8. Review Queue: Is Alfred getting overwhelmed? Too few items?
9. Dedup Rate: Normal (< 30%) or anomaly (> 50% suggests sourcing problem)?
10. Brand Voice: Any content that Alfred revised for voice? Capture the learning.
11. Idempotency: Any duplicate events that slipped through?
12. Rate Limiting: Any providers being hit too hard? Adjust concurrency?
```

---

## System Improvement Proposal (SIP) Format

```markdown
## SIP-[date]-[number]

**Area:** [Which audit area triggered this]
**Issue:** [What the problem is]
**Evidence:** [What data supports this finding]
**Proposed Change:** [Specific change to config, prompt, or policy]
**Risk Level:** low / medium / high
**Hermes Action:** [auto-apply / present to Alfred / defer]

---
Example:
SIP-2025-W3-01
Area: Brand Voice
Issue: Music Theory Secrets TikTok drafts are being approved but Alfred is editing them for specificity
Evidence: 6 of 8 approved drafts had "request revision" + "add specific chord name"
Proposed Change: Add to Vibe Marketing Agent prompt: "Always name specific chords, never say 'this chord' without naming it"
Risk Level: low
Hermes Action: auto-apply (low-risk prompt improvement)
```

---

## Auto-Apply vs Present to Alfred

**Hermes auto-applies (low risk):**
- Prompt clarifications that add specificity without changing direction
- Hashtag list updates (adding proven performers)
- Timing adjustments (posting time optimization)
- Rate limit threshold adjustments

**Present to Alfred (medium/high risk):**
- Changes to brand voice guidelines
- Changes to scoring weights
- New lead sources (requires Alfred approval of source)
- Changes to compliance policies
- Any change that affects what content is generated

---

## Integration Status

PLANNED — Phase 5.
