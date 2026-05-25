# Workflow Debugging — Examples

## Example 1: Compliance Miss

**What happened:** Gabriel drafted a Facebook ad for FundingReady Indiana that included the phrase "you may qualify for up to $50,000 in funding" without a disclaimer.

**Step where failure occurred:** QA Publish Guard — compliance check was not triggered

**Root cause:** Compliance miss — the funding amount claim triggered the compliance rule, but the checklist item for FundingReady Indiana wasn't explicit about dollar amounts.

**Specific fix:**
- File: `skills/qa-publish-guard/checklist.md`
- Add: "[ ] FundingReady Indiana content: any dollar amount must be followed by 'eligibility varies, contact [lender] to determine qualification'"

---

## Example 2: Bad Routing

**What happened:** Gabriel loaded `gabriel-cms` for a task that was actually about improving conversion on a specific CTA — should have loaded `website-cro`.

**Root cause:** Bad routing — task description said "update the homepage CTA" and Gabriel interpreted "update" as content management rather than conversion improvement.

**Specific fix:**
- File: `core/CONTEXT_ROUTER.md`
- Add decision rule: "If the task uses 'improve' + CTA/headline/hero → route to website-cro, not gabriel-cms"
