# Lead Scoring Rules — Colvin Content OS

Full 4-dimension scoring system. Every lead gets a `qualification_score` from 0-10 before entering the outreach pipeline.

---

## Scoring Dimensions

### Dimension 1: Firmographic Fit (0-4 points)

Does this person/company match the Ideal Customer Profile for this lane?

| Lane | 4 Points (Perfect Fit) | 2-3 Points (Good Fit) | 1 Point (Possible) | 0 Points (No Fit) |
|------|----------------------|----------------------|-------------------|-----------------|
| colvin_enterprises | Indianapolis small biz owner/CEO, 5-50 employees, service business | Indiana business owner, larger company | Any Indiana business owner | Out of state, employee (not owner) |
| indiana_backflow_directory | Licensed plumber, property manager, facilities director | Commercial building owner, church/school facilities | Homeowner with commercial property | Residential homeowner only |
| music_theory_secrets | Church musician, gospel pianist, worship leader | Self-taught piano player | Any musician | Non-musician |
| funding_ready_indiana | Small business owner in Indiana, 2-50 employees | Nonprofit director | Startup founder | Individual, large corporation |
| first_keys_indy | First-time homebuyer in Marion County | Anyone in Indianapolis area interested in buying | Indiana renter | Current homeowner |
| glory_engine_yahweh_comics | Faith-based media consumer, comic fan, Christian creator | Church community leader | General Christian audience | Non-faith audience |

### Dimension 2: Timing Signals (0-3 points)

Are there signals that this person has a current, active need?

| Signal | Points |
|--------|--------|
| Explicit trigger: "looking for backflow tester," "starting a business," "buying a home soon" | 3 |
| Recent business activity: new license, recent incorporation, new location | 2 |
| Content engagement: liked/commented on Alfred's content | 2 |
| Industry timing: recent compliance deadline, grant season open | 1 |
| No timing signal (general ICP match only) | 0 |

Maximum: 3 points

### Dimension 3: Channel Match (0-2 points)

Can Alfred actually reach this person through available channels?

| Match | Points |
|-------|--------|
| Email + LinkedIn both verified and accessible | 2 |
| One channel available (email OR LinkedIn) | 1 |
| No direct channel — awareness content only | 0 |

### Dimension 4: Lane Urgency (0-1 point)

Is this lane actively seeking leads right now?

| Urgency | Points |
|---------|--------|
| Lane is in active outreach campaign with open capacity | 1 |
| Lane is active but at capacity or paused | 0 |
| Lane is paused (piano_app) | 0 (auto-disqualify — do not score) |

---

## Total Score Calculation

```
qualification_score = firmographic_fit + timing_signals + channel_match + lane_urgency
Range: 0-10
```

---

## Routing by Score

| Score | Action |
|-------|--------|
| 7-10 | Outreach queue — dispatch to Email Copy Agent for draft |
| 5-6 | Save to CRM with status = 'scored' — monitor for timing upgrade |
| 3-4 | Archive — keep for 60 days, then purge if no upgrade |
| 0-2 | Immediate archive — not a fit at this time |

---

## Score Decay

Scores are re-evaluated if:
- A timing signal is added to the record (upgrade)
- A contact window expires and lead re-enters scoring
- Alfred provides feedback on a similar lead (adjust ICP calibration)
- The lead's status changes (e.g., company grows)

---

## Scoring Confidence

Scores are affected by data completeness:
- If `company` is null: -1 point from firmographic fit
- If `title` is null: -0.5 point from firmographic fit
- If `provenance.confidence < 0.6`: cap maximum score at 6 (cannot go to outreach queue on unverified data)

---

## Score Override

Alfred can manually override any lead's score via the CRM dashboard. Override is logged with reason in `notes` field. The override does not change the algorithm — it's a manual adjustment only.
