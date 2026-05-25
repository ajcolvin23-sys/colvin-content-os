# A/B Testing Workflow

End-to-end workflow for designing, launching, monitoring, and concluding A/B tests through Humblytics. One variable at a time. Always.

## The One-Variable Rule

**Every test changes exactly one element.** If you change the headline AND the CTA in the same test, you cannot know which caused the result. Gabriel will refuse to design multi-variable tests.

## Experiment Lifecycle

```
proposed → approved → running → monitoring → concluded → archived
```

- **proposed**: Gabriel drafts the test design
- **approved**: Alfred explicitly approves the test
- **running**: Test is live in Humblytics
- **monitoring**: Active tracking (no changes to live elements during this phase)
- **concluded**: Statistical significance reached OR time limit hit
- **archived**: Winner deployed, loser logged in rejected-findings.md

## Trigger Commands

- "design an experiment for [element]"
- "run an A/B test on [headline/CTA/layout]"
- "what should we test on [page/lane]?"

## Step Sequence

### Phase 1: Design

```
1. IDENTIFY_ELEMENT
   - What single element is being tested?
   - What is the current control version?
   - What is the hypothesis? ("We believe [change] will [result] because [evidence]")

2. EVIDENCE_CHECK
   - What evidence supports the variant? (evidence level required: 3+)
   - If evidence level < 3: recommend research first, not a test

3. DESIGN_VARIANT
   - Draft the variant (only the single changed element)
   - Confirm: is this truly one variable?

4. SET_SUCCESS_METRIC
   - Primary metric: what exactly are we measuring?
   - Success threshold: what result declares a winner? (e.g., >10% lift with p<0.05)
   - Time limit: maximum test duration (default: 14 days or 500 conversions, whichever first)

5. COMPLIANCE_CHECK
   - Is this test on a compliance-sensitive lane? → Katrina review required before launch
   - Does the variant contain any benefit claims, legal language, or pricing? → Stop and review

6. WRITE_EXPERIMENT_PROPOSAL
   - Save to logs/experiment-results.md with status: proposed
   - Include: hypothesis, control, variant, metric, success threshold, time limit
```

### Phase 2: Launch (Alfred Approves First)

```
7. ALFRED_APPROVES
   - Alfred explicitly says "run this test" or "approved"
   - Update experiment status: approved

8. SET_UP_IN_HUMBLYTICS
   - Load humblytics-experiment skill
   - Configure test: control vs. variant, traffic split (default 50/50)
   - Set monitoring alerts

9. DEPLOY_VARIANT
   - Stage variant in Supabase experiments table
   - Record experiment_id, start_date, control_version_id
   - Update status: running
```

### Phase 3: Monitor

```
10. CHECK-IN SCHEDULE
    - Day 3: sample size check (enough traffic to continue?)
    - Day 7: interim results (do NOT stop early unless catastrophic)
    - Day 14 or threshold: final read

11. DO NOT TOUCH
    - While a test is running: do NOT edit the control OR variant element
    - If Alfred wants to change the live page: pause test first, log pause reason

12. LOW-TRAFFIC PROTOCOL
    - If projected time to significance > 60 days: flag to Alfred
    - Options: expand test scope, accept lower confidence, or abandon
```

### Phase 4: Conclude

```
13. READ_RESULT
    - Winner declared if: primary metric improved AND statistical significance reached
    - No winner if: no significant difference after full run

14. DEPLOY_WINNER
    - If variant wins: deploy through cms-publishing-workflow.md
    - If control wins: log finding, keep control, update rejected-findings.md for variant idea

15. LOG_EXPERIMENT
    - Update logs/experiment-results.md with outcome
    - If variant wins: propose memory update (evidence level 5 for Alfred's own data)
    - Archive test in Supabase experiments table

16. EXTRACT_LEARNING
    - What did we learn? Write one-sentence finding.
    - Route through evidence-review skill (this is Alfred's own data = level 5)
    - Propose to approved-research-memory.md
```

## Rules

- Never run two tests on the same page element simultaneously
- Never stop a test early because results look good (wait for significance)
- Never run a test without a defined success metric and time limit
- Always log losers — losing variants are rejected-findings
