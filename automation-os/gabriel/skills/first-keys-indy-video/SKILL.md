---
name: first-keys-indy-video
description: Brand-specific video skill for First Keys Indy. Load alongside video-growth-architect for all First Keys Indy video, script, Remotion, or ad tasks.
---

# GABRIEL — FIRST KEYS INDY VIDEO SKILL

## Brand
First Keys Indy

## Audience
Marion County renters and first-time homebuyer prospects. Primarily:
- Renters 25–50 years old in Indianapolis / Marion County
- Families with income but not enough saved for a down payment
- People who assume homeownership is out of reach
- People who don't know assistance programs may exist
- People who fear rejection or assume they won't qualify
- People who need guidance, not pressure

## Core Offer
Help people check whether they may qualify for homebuyer assistance, including possible down payment support. The product is the eligibility check — not the grant itself.

## Primary CTA
**Check Your Eligibility**

## Secondary CTA
**See If You Qualify**

## Website
firstkeysindy.org

---

## Compliance Language — MANDATORY

### Always Use
- "You may qualify"
- "Programs may be available"
- "Check eligibility"
- "See what options may be available"
- "Many people never check"
- "Start with a simple eligibility check"
- "Options may exist"
- "Down payment assistance may be available"

### Never Use
- "Guaranteed approval"
- "Everyone qualifies"
- "Free house"
- "Instant approval"
- "Guaranteed grant money"
- "You will get X"
- "Free money for homebuyers"
- "Guaranteed down payment help"

**Compliance gate:** Every First Keys Indy video must pass compliance review before going to Alfred. Flag any language that resembles a guarantee.

---

## Core Pain Points (use in pain scenes)

In order of emotional impact:
1. Rent keeps rising and it feels out of control
2. The down payment feels impossible to save
3. "I can pay rent — I just can't save 20% at the same time"
4. "I didn't know there were programs that could help"
5. "I don't know if I qualify — I'm afraid to check"
6. "I assumed homeownership required perfect credit"
7. "Nobody showed me the path"
8. "I gave up and I shouldn't have"

---

## Proven Hook Library (10 best hooks)

Ranked by scroll-stop potential for Marion County audience:

1. "Most Marion County renters don't know this program exists."
2. "Your down payment may not be what's stopping you from buying a home."
3. "Marion County renters — don't give up on buying yet."
4. "You may be closer to owning a home than you think."
5. "Still renting? You may want to check this first."
6. "Before you say you can't buy, check your options."
7. "Saving for a down payment feels impossible. There may be help."
8. "Rent keeps rising, but most families never check for assistance."
9. "You don't need to figure out homebuying alone."
10. "This could be the first step toward your first keys."

**Hook rule:** Always name Marion County or Indianapolis in at least one scene. Local specificity is a trust signal.

---

## Default 25-Second Video Structure

```
0:00–0:03 — Hook
"Marion County renters…"
[Stressed renter, apartment, rising rent bill]

0:03–0:08 — Pain
"Rent keeps rising."
"Saving feels impossible."
"But you may be closer than you think."
[Kinetic pain lines, dark/pressure mood]

0:08–0:13 — Reveal
"You may qualify for help with your down payment."
[Gold badge burst, hope mood]

0:13–0:18 — Trust
"First Keys Indy helps Marion County families check eligibility and take the next step."
[Local credibility badge, family imagery]

0:18–0:22 — Transformation
"Imagine getting the keys to your first home."
[Home exterior, key moment, warm amber light]

0:22–0:25 — CTA
"Check your eligibility today."
"See If You Qualify" button
"firstkeysindy.org"
```

---

## 15-Second Video Structure (retargeting / high-intent)

```
0:00–0:03 — Hook
"Your down payment may not be the real problem."

0:03–0:08 — Reveal
"Marion County down payment assistance may be available."
Badge: "Check Your Eligibility"

0:08–0:12 — Transformation
"Many Marion County renters never check. Be different."

0:12–0:15 — CTA
"See if you qualify. 2 minutes."
"See If You Qualify" button
```

---

## Remotion Configuration

```json
{
  "composition_id": "FirstKeysAd",
  "brand": "first_keys_indy",
  "platform": "tiktok",
  "format": "9:16",
  "render_format": "9:16"
}
```

**Scene types available in FirstKeysAd:**
- `hook` → HookScene (punch-in headline + subheadline)
- `pain` → KineticPainScene (word-by-word lines, dark bg, last line gold)
- `reveal` → GrantRevealScene (gold badge burst + headline)
- `trust` → TrustScene (local credibility badge + brand name)
- `transformation` → TransformationScene (sunrise glow + 🗝️ key icon)
- `cta` → CTAScene (pulsing button + footer URL)

**Theme colors:**
- Navy: `#102033` / `#0A1520`
- Gold: `#F2B84B`
- Green: `#2E7D5B`
- Cream: `#FFF7E8`

**Safe zone:** top: 120px, bottom: 220px (TikTok UI chrome)

---

## Visual Direction

**Problem scenes (hook, pain):**
- Stressed renter
- Rising rent bill close-up
- Apartment hallway
- Lease paperwork
- Worried expression
- Dark / pressure mood (`rgba(12, 30, 68, 0.38)` cold blue grade)

**Solution scenes (reveal, trust, transformation):**
- Family holding keys
- Home exterior (Marion County neighborhood)
- Warm interior lighting
- Couple celebrating
- Hopeful mood (`rgba(208, 136, 26, 0.24)` warm amber grade)
- Gold/cream accents

**All photography must feature Black families.** This is a compliance and audience alignment rule, not optional.

---

## Required Campaign Output

For every First Keys Indy video campaign, Gabriel must generate:

- [ ] 5 hooks (compliance-reviewed)
- [ ] 3 pain sequences (kinetic lines format)
- [ ] 2 CTA options
- [ ] 1 full 25-second version (Remotion scene JSON)
- [ ] 1 fast 15-second version (Remotion scene JSON)
- [ ] Compliance review pass/fail
- [ ] Remotion `composition_id: 'FirstKeysAd'` confirmed

---

## Sweet Spot

**Platform:** TikTok + Facebook Reels
**What drives engagement:** Local pain (rent rising in Marion County) + hope (programs may exist) + low-friction CTA (just check)
**What to measure:** 3-second hold rate, eligibility form starts, landing page visits
**What to avoid:** Anything that sounds like a guaranteed outcome

---

# Failure Log Notes

If a First Keys Indy video fails compliance → append to `failure-log.md` with the exact phrase that triggered it.
If a hook performs below 3-second hold rate of 40% → downgrade it in the hook library.
