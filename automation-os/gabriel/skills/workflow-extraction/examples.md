# Workflow Extraction — Examples

## Example 1: Good Extraction

**Finding:** LinkedIn openers that reference the prospect's specific job title pain get 2.3× higher reply rates (Evidence Level 3, CXL source).

**Extracted Workflow:**
Name: `pain-first-linkedin-opener`
Trigger: When drafting any LinkedIn connection request for an SMB owner
Status: Draft / Needs Real-World Validation

Steps:
1. Look up prospect's job title on LinkedIn
2. Map job title to most common pain from LEAD_SIGNAL_LIBRARY.md
3. Check prospect's last 3 posts for specific pain language they've used
4. Open message with their exact pain language (theirs if available, mapped if not)
5. State Alfred's specific outcome in one sentence
6. Close with a yes/no question — never a meeting request

Decision Rules:
- If prospect has no recent posts → use job title mapping
- If prospect is in a compliance lane → route through qa-publish-guard first

Location: Add to `skills/content-engine/SKILL.md` under LinkedIn outreach section

---

## Example 2: Bad Extraction Attempt

**Situation:** Gabriel tried to extract a workflow from a Level 2 finding about email subject lines.

**Why it failed:** Level 2 evidence means "interesting pattern, no hard data." Extracting a workflow from Level 2 creates an unproven process that Gabriel will run with false confidence.

**Correct action:** Log the finding, propose it as an experiment idea in `logs/proposed-skill-updates.md`, and wait for Alfred to run the test before extracting a workflow.
