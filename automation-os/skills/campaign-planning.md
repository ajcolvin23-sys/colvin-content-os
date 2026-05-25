# Skill: Campaign Planning

## What Is a Campaign?

A campaign is a coordinated, multi-touch effort to move a specific audience segment toward a specific outcome. Not a single post. Not a one-time email. A planned sequence with a goal, audience, timeline, and measured result.

## Campaign Template

```json
{
  "campaign_name": "string",
  "lane": "business_lane",
  "goal": "what success looks like (calls booked, leads, sales, subscribers)",
  "target_audience": "specific person description",
  "channels": ["linkedin", "email", "instagram", etc.],
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD",
  "budget": "organic|paid — amount if paid",
  "sequence_steps": [
    { "day": 0, "channel": "linkedin", "action": "connection request", "content": "draft" },
    { "day": 3, "channel": "linkedin", "action": "follow-up", "content": "draft" }
  ],
  "success_metrics": ["replies", "calls_booked", "opt_ins", "sales"],
  "compliance_review": "none|katrina_required",
  "status": "draft|approved|active|paused|completed"
}
```

## Campaign Rules

1. Every campaign needs Alfred's approval before status → "active"
2. No outreach campaign touches the same prospect twice within 30 days
3. No campaign makes specific outcome guarantees
4. Katrina reviews all `first_keys_indy`, `funding_ready_indiana`, `girls_got_game` campaigns
5. Campaign performance is tracked in Supabase `campaigns` table

## Campaign Scoring (Which to Run First)

Score each proposed campaign 1–10:
- Audience clarity (do we know exactly who): 0–3 pts
- Channel readiness (do we have the content + access): 0–3 pts
- ROI potential (realistic outcome for Alfred's time): 0–2 pts
- Lane priority (is this lane active + hot): 0–2 pts

Run campaigns with score >= 7 first.

## Minimum Viable Campaign

If time is limited, the MVCs are:
1. 1 LinkedIn outreach sequence (3 touches, 10 prospects)
2. 1 email nurture sequence (3 emails, existing opt-in list)
3. 1 piece of organic content per active lane per week
