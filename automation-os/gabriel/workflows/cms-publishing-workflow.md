# CMS Publishing Workflow

End-to-end workflow for drafting, reviewing, and publishing content through Gabriel's CMS layer. Governs all website content changes across Alfred's 9 business lanes.

## Principle

Draft → QA → Alfred approves → Publish. No exceptions.

Gabriel never auto-publishes. Never overwrites a live page without a comparison. Never replaces a winning CTA without evidence or an active test.

## Trigger Commands

- "draft [content type] for [site/lane]"
- "update the [page/section] on [site]"
- "create a new [hero/CTA/blog/landing page] for [lane]"

## Pre-Flight Checklist (Before Drafting)

```
□ Lane identified (which of Alfred's 9 businesses?)
□ Content type identified (hero | CTA | landing page | blog | email | social)
□ Compliance check: is this lane compliance-sensitive? (first_keys_indy, funding_ready_indiana, girls_got_game → Katrina review)
□ Is there a current live version? If yes: compare before replacing
□ Is there an active A/B test running on this element? If yes: do not touch until test concludes
```

## Step Sequence

```
1. IDENTIFY_LANE
   - Which site? What URL? What business context?
   - Load: business-context/BUSINESS_PORTFOLIO.md for that lane

2. LOAD_SKILL
   - gabriel-cms for drafting
   - paper-design-system if UI components involved
   - qa-publish-guard always runs before delivery

3. DRAFT_CONTENT
   - Follow PAPER design system constraints
   - Match lane tone (not all lanes use same voice)
   - Include content_version_id in frontmatter
   - Do NOT embed live data or API values — use placeholders

4. INTERNAL_QA
   - Run qa-publish-guard checklist
   - Check: hallucination risk, compliance language, placeholder detection
   - Check: mobile responsiveness consideration, CTA clarity
   - Classify: PASS | REVISE | REJECT

5. DELIVER_TO_ALFRED
   - If PASS: "Here is the draft. Review and approve to publish."
   - If REVISE: Deliver revised version with change notes
   - If REJECT: Explain why and what's needed before retrying

6. ALFRED_APPROVES
   - Alfred must explicitly say "approved" or "publish this"
   - Ambiguous approval ("looks good") = ask for explicit confirmation

7. STAGE_CONTENT
   - Write approved content to Supabase publish_queue table
   - Set status: staged, approved_by: alfred, approved_date: today

8. PUBLISH
   - Deploy from publish_queue to live site
   - Save content_version to content_versions table
   - Log: which element, what changed, previous version ID

9. POST-PUBLISH
   - Verify live URL renders correctly
   - Log in logs/run-log.md
   - Flag for Humblytics monitoring if CTA or conversion element changed
```

## Compliance Lane Rules

| Lane | Review Required |
|------|----------------|
| first_keys_indy | Katrina review for all benefit claims, legal references |
| funding_ready_indiana | Katrina review for all benefit claims, legal references |
| girls_got_game | Katrina review for any athlete references, endorsements |
| All others | Alfred review only |

## Rollback Protocol

If published content causes issues:
1. Load previous content_version from content_versions table
2. Restore and log rollback_event
3. Notify Alfred
4. Do NOT re-publish the problematic version until root cause is understood
