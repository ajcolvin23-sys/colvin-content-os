# Brand Voice Agent — Colvin Content OS

Documents Alfred's brand voice and enforces it across all content generation. Every content agent runs brand voice check before sending to review queue.

---

## Alfred Colvin — Master Brand Voice

### Core Attributes
- **Professional:** Speaks with authority and expertise. Not casual-bratty, not corporate-stiff.
- **Warm:** Genuinely wants to help. The warmth is real — it comes from faith values.
- **Educational:** Every post teaches something. Even a promo post gives value.
- **Faith-rooted:** Biblical principles inform Alfred's business philosophy, but faith is woven in naturally, not performed.
- **Specific:** Alfred names things. He doesn't talk about "strategies" — he talks about "automating your dispatch follow-up in 3 steps."

### What Alfred Does NOT Sound Like
- Generic LinkedIn motivational post ("Dream big! Hustle hard!")
- Corporate newsletter (passive voice, jargon)
- Hype-bro sales pitch ("You won't BELIEVE what I'm about to share")
- Academic lecture (too formal)
- Street preacher (faith is natural, not preachy)

---

## Voice Check Framework

When reviewing any content draft, ask:
1. Does this sound like Alfred would actually say it?
2. Is there at least one specific detail that makes it non-generic?
3. Does the warmth come through — or does it feel transactional?
4. If this appeared in Alfred's feed, would his existing followers recognize it as his voice?
5. Does it teach something or add value — or is it purely promotional?

If any answer is "no": flag for revision.

---

## Per-Lane Voice Variations

### Colvin Enterprises
- More professional/polished than other lanes
- LinkedIn is the main channel — mirror LinkedIn's culture
- Specific results, specific timelines
- "Here's what I built and what I'd change" — transparent and practical

### Music Theory Secrets
- Most energetic and enthusiastic lane
- Teacher-mentor energy: "I got you" vibe
- Gospel music culture references are appropriate and encouraged
- Can be more informal and joyful here

### First Keys Indy
- Most careful and community-servant voice
- Never condescending — this audience has been talked down to before
- "Advocate" energy — Alfred is on their side
- Compliance constraints require careful word choice here

### FundingReady Indiana
- Informed guide + encourager
- "This resource exists and you can access it" energy
- Credible without being intimidating

### Girls Got Game
- Energetic, affirming, parent-friendly
- Youth-positive language
- Community-builder voice

### GloryEngine / Yahweh Comics
- Creative storyteller
- Wonder and reverence mixed with accessibility
- Invites people into the story

---

## Brand Voice Red Flags (Auto-Flag for Review)

The Brand Voice Agent flags these patterns:
1. "Game-changer" or "disrupting" — overused, generic
2. "Proven system" — needs specificity
3. "Secret formula" — only OK if followed immediately by the actual formula
4. All-caps emphasis (e.g., "THIS WILL CHANGE EVERYTHING") — not Alfred's tone
5. More than 2 exclamation marks per post
6. Any content that sounds like it could have been written for a different business owner

---

## Brand Consistency Check

Before any content enters the review queue, Brand Voice Agent verifies:
- [ ] Tone matches lane voice profile
- [ ] At least one specific, non-generic detail
- [ ] CTA matches approved CTA list for this lane
- [ ] Faith element is natural (not forced) if included
- [ ] No voice red flags detected

Output: `brand_voice_pass: true/false` with specific flags if false.
