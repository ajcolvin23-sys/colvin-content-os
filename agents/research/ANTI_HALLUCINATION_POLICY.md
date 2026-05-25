# Anti-Hallucination Policy — Colvin Content OS

Hallucination is the most dangerous failure mode for this system. Alfred depends on accurate information for legal-adjacent (HUD/RESPA), financial (grant info), and business-critical content.

---

## Absolute Rules

### Never invent citations
- Every URL must be a real URL that was actually accessed
- Never generate a plausible-sounding URL that was not verified
- If a source cannot be found, state "Source not found" — do not fabricate one

### Never invent statistics
- No percentage, number, or figure without a real, accessed, cited source
- Never write "Studies show X%" without naming the study and providing the URL
- If no statistics are available: say "No reliable statistics found for this claim"
- Exception: math derived from cited figures is allowed if derivation is shown

### Never invent company details
- Never make up a company's address, phone number, employee count, revenue, or founding year
- If company data is not available from a verified source: set field to null
- Never infer a company's size from its website appearance

### Never invent personal details
- Never guess a person's email address
- Never infer a person's decision-making authority from their title alone
- Never assume a person still holds their listed role (verify recency)

### Never invent program details
- Never state DPA amounts for First Keys Indy without citing the current IHCDA program page
- Never state grant amounts for FundingReady Indiana without citing the current program
- Program details change — always state the access date of any program-specific fact

---

## Hallucination Triggers to Watch

These patterns in LLM output often signal hallucination:
1. **Specific numbers with no source** ("87% of Indianapolis businesses...")
2. **Named studies with no URL** ("A Harvard study found...")
3. **Current status claims about dynamic info** ("The grant is currently accepting applications")
4. **Contact details that weren't in source material** (invented emails, phones)
5. **Competitor facts** ("Company X charges $Y" — unless directly from their website)
6. **Government program specifics without official URL** (DPA limits, grant amounts)

---

## Anti-Hallucination Prompt Patterns

When prompting LLMs for research:
```
IMPORTANT: You must only include facts that come from the provided source material.
If information is not in the sources, say "Not found in sources" rather than generating it.
Do not infer or extrapolate numerical data.
Every specific claim must reference which source it came from by number.
```

---

## Post-Generation Hallucination Check

Before any research report is returned, run this checklist:

- [ ] Every statistic has a source URL
- [ ] Every company claim was found in the source material
- [ ] Every government program figure is from an official .gov source
- [ ] No URLs were generated without being verified as real
- [ ] No contact details were invented
- [ ] Time-sensitive facts are flagged with access date
- [ ] "Unknowns" section documents gaps rather than inventing answers

If any check fails: flag the item, quarantine the claim, do not include in output.

---

## Downstream Content Protection

When research output is used by content agents:
- Content agents must carry forward the confidence scores
- Any claim with confidence < 0.6 must be qualified in the content ("may," "suggests," "appears")
- Any claim with confidence < 0.4 cannot appear in final content
- Compliance-sensitive claims (HUD, grants) must remain at confidence 0.85+ to publish

---

## Hallucination Incident Handling

If a hallucinated fact is detected in published content:
1. P1 incident: HALLUCINATION_IN_PUBLISHED_CONTENT
2. Content must be corrected or removed immediately
3. Alfred must approve the correction
4. Review what prompted the hallucination and update prompts
5. Add the specific hallucination pattern to this policy's trigger list
