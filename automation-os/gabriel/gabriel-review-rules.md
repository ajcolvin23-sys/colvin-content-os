# Gabriel Review Rules

## The Golden Rule

Gabriel PREPARES. Alfred APPROVES. Humans EXECUTE.

No output from Gabriel should ever reach a prospect, platform, or public channel without explicit approval from Alfred.

## What Goes Into the Review Queue

All of the following require Alfred's review before any action:

| Output Type | Review Required | Why |
|---|---|---|
| LinkedIn connection request | YES | Outreach to a real person |
| LinkedIn follow-up message | YES | Outreach to a real person |
| Email draft | YES | Outreach to a real person |
| Social media post | YES | Public-facing content |
| Blog post or article | YES | Public-facing content |
| Video script | YES | Brand content |
| Email newsletter | YES | Mass communication |
| SEO page copy | YES | Published to website |
| Grant application draft | YES | Financial + legal implications |
| Partner proposal | YES | Business commitment |

## What Does NOT Require Review

| Output Type | No Review Needed | Why |
|---|---|---|
| Internal daily report | No review | Private summary only |
| Lead score | No review | Internal ranking only |
| Dedup result | No review | Deterministic process |
| Memory save | No review | Saving data, no external action |
| Telegram brief to Alfred | No review | Alfred is the recipient |

## Review Queue Format

Each item in the review queue must include:

```json
{
  "id": "uuid",
  "type": "outreach|content|seo|opportunity",
  "lane": "business_lane",
  "priority_score": 8,
  "subject": "One-line description",
  "draft": "The actual content",
  "context": "Why this was created / who this is for",
  "compliance_flags": [],
  "katrina_review_required": false,
  "created_at": "ISO timestamp",
  "status": "pending_review"
}
```

## Katrina Gate Escalation

Items in these lanes automatically require Katrina review before Alfred approves:
- `first_keys_indy` — HUD/RESPA compliance
- `funding_ready_indiana` — Grant/funding language
- `girls_got_game` — Youth safety + nonprofit tone

Items with these keywords also escalate to Katrina:
`guarantee`, `guaranteed`, `government assistance`, `grant`, `nonprofit`, `legal`, `investment`, `minor`, `youth`, `church`, `donor`

## Rejection and Revision

If Alfred marks an item as "revise":
1. Gabriel stores the revision note
2. Gabriel regenerates with the feedback applied
3. Item returns to review queue with `status = 'revised'`
4. Max revisions per item: 2
5. After 2 revisions, escalate to manual handling

## Stale Items

Items sitting in `pending_review` for 3+ days:
- If score >= 7: send Telegram reminder to Alfred
- If score < 6: archive automatically
- Never re-send outreach drafts for leads that have since responded or been marked "not interested"
