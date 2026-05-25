---
file: CONTEXT_ROUTER.md
role: Skill routing logic — load this when you need to decide which skill to activate
load: When task type is unclear or spans multiple domains
---

# Context Router

Before loading any skill, answer these 7 questions internally:

1. **What is the user asking Gabriel to do?**
2. **Which of Alfred's 9 businesses does it apply to?**
3. **Which single skill is most relevant?** (load only one)
4. **What is the minimum context needed?** (do not load extra files)
5. **Does this require human approval before output?**
6. **Does this need QA before delivery?**
7. **Does this need a memory update after completion?**

## Skill Routing Table

### Website & Content (Original Skills)

| Task Type | Load This Skill |
|---|---|
| Create, edit, schedule, or version website content | `skills/gabriel-cms` |
| Improve headline, CTA, hero, offer, or conversion copy | `skills/website-cro` |
| Research a market, validate an idea, or score an opportunity | `skills/idea-browser-growth` |
| Design a landing page, component, or layout variation | `skills/paper-design-system` |
| Set up or evaluate an A/B test | `skills/humblytics-experiment` |
| Create LinkedIn, Facebook, TikTok, Instagram, email, or blog content | `skills/content-engine` |
| Review anything before it goes live | `skills/qa-publish-guard` |
| Review performance data, update memory, or improve a workflow | `skills/analytics-learning-loop` |

### Research & Intelligence

| Task Type | Load This Skill |
|---|---|
| Run a single-topic, time-boxed research session | `skills/market-research-loop` |
| Extract marketing tactics from elite sources | `skills/marketing-intelligence` |
| Research conversion rate optimization evidence | `skills/conversion-research` |
| Find, profile, and score leads | `skills/lead-intelligence` |
| Detect automation buying signals in a prospect | `skills/automation-buyer-detection` |
| Study an elite company (Amazon, Apple, Stripe, etc.) | `skills/elite-company-analysis` |
| Study a top earner, consultant, creator, or agency | `skills/top-earner-analysis` |
| Study a sports or entertainment brand | `skills/sports-branding-analysis` |

### Learning & Improvement

| Task Type | Load This Skill |
|---|---|
| Convert a research finding into an executable workflow | `skills/workflow-extraction` |
| Score a finding's evidence quality before proposing | `skills/evidence-review` |
| Propose or apply a skill update | `skills/skill-improvement` |
| Review, promote, or archive memory items | `skills/memory-curation` |
| Design an A/B experiment from a validated insight | `skills/experiment-design` |
| Run the Friday weekly research synthesis | `skills/weekly-research-review` |
| Review a concluded experiment and extract the learning | `skills/experiment-learning` |
| Run the multi-session research orchestrator | `skills/research-loop` |

### System Health

| Task Type | Load This Skill |
|---|---|
| Diagnose a workflow or run failure | `skills/workflow-debugging` |
| Run the system-wide weekly reflection | `skills/weekly-reflection` |

## Multi-Skill Tasks

If a task clearly spans two skills, run them in sequence:
1. Primary skill first
2. `qa-publish-guard` always last before any output is delivered to Alfred

Never load more than 2 skills in one task.

## When in Doubt

Load `skills/qa-publish-guard` and ask Alfred for clarification before proceeding.

## Business Lane Quick Reference

Load `business-context/BUSINESS_PORTFOLIO.md` when you need lane details.
Do not load it globally — only load it when the task requires business context.
