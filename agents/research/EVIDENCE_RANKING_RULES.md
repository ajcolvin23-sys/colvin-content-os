# Evidence Ranking Rules — Colvin Content OS

Scoring system for evidence quality. Used by Research Agent to rank claims and assign confidence scores.

---

## Evidence Score Components

Each piece of evidence is scored on 4 dimensions. Total score = sum of all components.

### Dimension 1: Recency (0-3 points)

| Age of Evidence | Score |
|----------------|-------|
| Published within 6 months | 3 |
| Published within 1 year | 2 |
| Published within 3 years | 1 |
| Published > 3 years ago | 0 |

For time-sensitive topics (government programs, grant availability, market data): apply 1.5x weight.

### Dimension 2: Authority (0-4 points)

| Source Type | Score |
|------------|-------|
| Primary government/official source (Tier 1) | 4 |
| Established credible media (Tier 2) | 3 |
| Industry publication / professional org | 2 |
| Third-party aggregator (Tier 3) | 1 |
| Unverifiable / anonymous | 0 |

### Dimension 3: Corroboration (0-2 points)

| Corroboration Level | Score |
|--------------------|-------|
| 3+ independent sources confirm | 2 |
| 2 independent sources confirm | 1 |
| Only 1 source (no corroboration) | 0 |

Independent means: from different organizations, not citing each other.

### Dimension 4: Relevance (0-1 point)

| Relevance | Score |
|-----------|-------|
| Directly addresses the research question | 1 |
| Tangentially related | 0 |

---

## Total Evidence Score → Confidence Rating

| Total Score | Confidence | Label |
|------------|-----------|-------|
| 8-10 | 0.9-1.0 | Verified Fact |
| 6-7 | 0.7-0.89 | High Confidence |
| 4-5 | 0.5-0.69 | Reasoned Inference |
| 2-3 | 0.3-0.49 | Assumption |
| 0-1 | 0.0-0.29 | Unknown / Unverifiable |

---

## Evidence Handling by Confidence Level

| Confidence Label | Treatment in Content |
|----------------|---------------------|
| Verified Fact | Can be stated as fact in content |
| High Confidence | Can be stated with minor qualifier: "according to [source]" |
| Reasoned Inference | Must be stated as inference: "research suggests," "evidence indicates" |
| Assumption | Cannot be stated as fact. Must be flagged in research report. Not for content. |
| Unknown | Do not publish. Note as gap in knowledge. |

---

## Special Rules for Compliance-Sensitive Claims

For First Keys Indy, FundingReady Indiana:
- Financial figures: must be Verified Fact (8-10 score) to use in content
- Program availability: must be re-verified every 30 days
- "Guaranteed" language: PROHIBITED regardless of evidence score

For Girls Got Game:
- Any claim about youth program outcomes: minimum Verified Fact score

---

## Conflicting Evidence Handling

When two sources contradict each other:
1. Score each source independently
2. The higher-scoring source takes precedence
3. If scores are equal: note the conflict in research report
4. Apply the more conservative/cautious claim in content
5. If conflict is in a compliance-sensitive area: flag and do not publish until resolved

---

## Evidence Ranking in Research Reports

In the research report output, each fact includes:
```json
{
  "claim": "Indiana Housing Finance Authority offers up to $X in DPA",
  "evidence_score": 9,
  "confidence": 0.92,
  "label": "Verified Fact",
  "sources": [
    {
      "url": "https://www.ihcda.in.gov/...",
      "tier": 1,
      "accessed": "2025-01-15",
      "recency_score": 3,
      "authority_score": 4,
      "corroboration_score": 2,
      "relevance_score": 1
    }
  ]
}
```
