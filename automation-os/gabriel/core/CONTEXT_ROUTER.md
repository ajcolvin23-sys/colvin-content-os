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

## Multi-Skill Tasks

If a task clearly spans two skills, run them in sequence:
1. Primary skill first
2. `qa-publish-guard` always last before any output is delivered

Never load more than 2 skills in one task.

## When in Doubt

Load `skills/qa-publish-guard` and ask Alfred for clarification before proceeding.

## Business Lane Quick Reference

Load `business-context/BUSINESS_PORTFOLIO.md` when you need lane details.
Do not load it globally — only load it when the task requires business context.
