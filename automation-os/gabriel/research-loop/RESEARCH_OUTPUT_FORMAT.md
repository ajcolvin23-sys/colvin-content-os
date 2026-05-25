---
file: RESEARCH_OUTPUT_FORMAT.md
role: Exact template for every research run output — markdown and JSON
load: During any research run, before writing output
---

# Research Output Format

Every research run produces two artifacts:
1. A markdown entry in `logs/research-log.md`
2. A JSON file at `research-output/latest-daily-research.json` (overwrite with each run)

---

## Markdown Format (for logs/research-log.md)

```markdown
---
date: YYYY-MM-DD
topic: [research topic]
category: marketing | conversion | lead-gen | automation-buyer | elite-company | top-earner | sports-branding | workflow
business_focus: [which of Alfred's 9 lanes this applies to most]
evidence_level: 1 | 2 | 3 | 4 | 5
---

## Direct Finding

[One clear, specific sentence. What was learned. Not vague.]

## Why It Matters for Gabriel

[1–2 sentences. How this applies to Alfred's business context.]

## Evidence Quality

- Source: [specific source name and type]
- Source tier: primary | high | medium | low | weak
- Classification: fact | inference | pattern | hypothesis
- Evidence level: [1–5]

## Source Notes

[Direct citation or URL. If no URL available, describe how to verify.]

## Extracted Workflow

[Step-by-step process extracted from the research. Numbered list. Specific enough to execute.]

## How Gabriel Can Use It

[Exactly which business, which page, which content type, which offer.]

## Skill to Update

[skill-name or "none"]

## Checklist to Update

[checklist file path or "none"]

## CMS or Marketing Test to Run

[Specific test idea. Not vague. Include control vs. variant.]

## Lead-Generation Use Case

[Exactly which prospect type this helps find or qualify.]

## Automation Offer Use Case

[Which of Alfred's automation offers this supports.]

## Confidence Score

[0.0–10.0 based on scoring rubric]

## Risks or Limitations

[What could make this finding wrong or inapplicable.]

## Next Action

[One concrete next step. Assign to: Gabriel | Alfred | hold for weekly review]
```

---

## JSON Format (for research-output/)

```json
{
  "date": "YYYY-MM-DD",
  "research_topic": "",
  "category": "marketing | conversion | lead-gen | automation-buyer | elite-company | top-earner | sports-branding | workflow",
  "business_focus": "",
  "direct_finding": "",
  "evidence_level": 0,
  "source_quality": "primary | high | medium | low | weak",
  "source_notes": "",
  "classification": "fact | inference | pattern | hypothesis",
  "extracted_workflow": "",
  "gabriel_application": "",
  "skill_to_update": "",
  "checklist_to_update": "",
  "experiment_to_run": "",
  "lead_generation_use_case": "",
  "automation_offer_use_case": "",
  "confidence_score": 0.0,
  "risk_or_limitation": "",
  "next_action": "",
  "proposed_memory_update": false,
  "proposed_skill_update": false,
  "status": "proposed"
}
```

---

## Weekly Review JSON (research-output/latest-weekly-review.json)

```json
{
  "week_ending": "YYYY-MM-DD",
  "daily_runs_completed": 0,
  "elite_company_studied": "",
  "top_earner_studied": "",
  "sports_brand_studied": "",
  "automation_trend_studied": "",
  "repeated_patterns": [],
  "promoted_to_memory": [],
  "proposed_skill_updates": [],
  "proposed_workflow_updates": [],
  "recommended_experiments": [],
  "next_week_research_agenda": []
}
```

---

## Monthly Synthesis JSON (research-output/latest-monthly-synthesis.json)

```json
{
  "month": "YYYY-MM",
  "weeks_completed": 0,
  "top_patterns_identified": [],
  "high_confidence_principles": [],
  "archived_weak_assumptions": [],
  "new_gabriel_workflows_proposed": [],
  "new_offer_ideas": [],
  "new_lead_gen_systems_proposed": [],
  "new_content_frameworks_proposed": [],
  "skills_recommended_for_improvement": [],
  "workflows_recommended_for_automation": []
}
```
