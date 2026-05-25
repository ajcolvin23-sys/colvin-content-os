# Master Workflow Map — Colvin Content OS

Complete registry of every workflow. All workflows require Alfred's approval before any output is published, sent, or rendered.

---

## Workflow Registry

| Workflow | Trigger | Agents Involved | Output | Approval Required | Cron | Status |
|----------|---------|----------------|--------|-------------------|------|--------|
| Daily Lead Workflow | 7 AM ET daily | Hermes, Research, Lead Finder, Lead Enrichment, Lead Scoring, Lead Dedup, Email Copy, Compliance Check, Human Review Gateway | Lead records + outreach drafts in review queue | YES — Alfred approves before any outreach | `0 7 * * *` | PLANNED |
| Daily Marketing Workflow | 8 AM ET daily | Hermes, Vibe Marketing, Campaign Angle, Social Media, Caption/Hashtag, Brand Voice, Compliance Check, Content Calendar, Human Review Gateway | Social post drafts + video concepts in review queue | YES — Alfred approves before any post is published | `0 8 * * *` | PLANNED |
| Daily Remotion Content Workflow | 10 AM ET daily | Gabriel Remotion Studio, Remotion Template, Remotion Script Writer, Remotion Scene Planner, Remotion Caption Timing, Remotion Asset Manifest, Remotion Video Agent, Schema Validator, Compliance Check, Human Review Gateway, Remotion MCP | Rendered video OR approved blueprint in queue | YES — Alfred approves blueprint before render triggers | `0 10 * * *` | PLANNED |
| Email Outreach Workflow | After Daily Lead Workflow OR manual | Hermes, Research, Outbound Sequence, Email Copy, Compliance Check, Lead Dedup, Human Review Gateway | Personalized email drafts in review queue | YES — Alfred approves before any email is sent | Triggered | PLANNED |
| Funnel Creation Workflow | Manual trigger | Hermes, Funnel Builder, Landing Page Copy, Lead Magnet, Form Question, Offer Positioning, Nurture Sequence, Compliance Check, Human Review Gateway | Landing page + email sequence in review queue | YES — Alfred approves before any page goes live | Manual | PLANNED |
| Admin QA Workflow | 6 AM ET daily | Hermes, Admin QA, System Health Check, Schema Validator | QA report + health score in Supabase | P2+ incidents only | `0 6 * * *` | PLANNED |
| Weekly Optimization Workflow | Monday 9 AM ET | Hermes, Automation Audit, Conversion Audit, Error Log Review | SIP (System Improvement Proposal) in review queue | YES — Alfred approves config changes | `0 9 * * 1` | PLANNED |
| Incident Recovery Workflow | On P1/P2 incident | Hermes, affected agent, Human Review Gateway | Incident record + recovery action in Supabase | YES — Alfred confirms recovery action | Event-triggered | PLANNED |
| Stage Replay Workflow | On recoverable failure | Hermes, affected stage agent | Replayed stage output + updated workflow_run record | Only for non-idempotency-safe stages | Event-triggered | PLANNED |
| Gabriel Daily Run (15 steps) | 7 AM ET daily | Gabriel Coordinator + all sub-agents | Daily brief to Alfred via Telegram | YES — top 3 actions require approval | `0 7 * * *` | IMPLEMENTED (partial) |

---

## Workflow Trigger Types

| Type | Examples | Notes |
|------|---------|-------|
| Daily cron | Lead, Marketing, Remotion, Admin QA | Auto-runs at set times |
| Weekly cron | Weekly Optimization | Runs once per week |
| Event-triggered | Incident Recovery, Stage Replay | Triggered by system events |
| Triggered by another workflow | Email Outreach (after Lead Workflow) | Chained workflows |
| Manual | Funnel Creation, any "on demand" | Alfred or Hermes manual trigger |

---

## Approval Gate Summary

Every workflow has at least one human approval gate before any external action occurs.

| Workflow | Approval Gate Location | What Requires Approval |
|----------|----------------------|----------------------|
| Daily Lead | Stage 12 — Review Queue Submission | Outreach drafts before sending |
| Daily Marketing | Stage 11 — Review Queue Submission | Social posts before publishing |
| Daily Remotion | Stage 10 — Approval Gate (BLOCKS) | Blueprint before render triggers |
| Email Outreach | Stage 7 — Review Queue Submission | Email drafts before sending |
| Funnel Creation | Stage 10 — Review Queue Submission | All funnel assets before going live |
| Admin QA | Stage 9 — Incident routing | P2+ incidents before system changes |
| Weekly Optimization | Stage 9 — SIP submission | Config changes before applying |

---

## Daily Workflow Timeline

```
4:00 AM   CRM Hygiene Agent (admin/CRM_HYGIENE_AGENT.md)
5:00 AM   Backup Restore QA Agent (admin/BACKUP_RESTORE_QA_AGENT.md)
6:00 AM   Admin QA Workflow
7:00 AM   Daily Lead Workflow + Gabriel Daily Run
8:00 AM   Daily Marketing Workflow
9:00 AM   Email Outreach Workflow (triggered after Lead Workflow)
10:00 AM  Daily Remotion Content Workflow
8:00 PM   Error Log Review Agent
9:00 PM   Daily Report Agent → Telegram brief to Alfred
Every 5min  Hermes Supervisor health checks
Every 30min System Health Check Agent
```

---

## Volume Controls (All Workflows)

| Workflow | Daily Max |
|----------|----------|
| Outreach drafts across all lanes | 15 total |
| Outreach drafts per lane per day | 3-5 |
| Remotion blueprints per day | 1 |
| Video concept briefs (marketing) | 1-2 |
| Social posts (varies by lane — see DAILY_MARKETING_WORKFLOW.md) | ~9 per day total |

---

## Integration Status

All workflows PLANNED — Phase 2-5. See IMPLEMENTATION_PLAN.md for build order.
Current: Gabriel Daily Run partially implemented in automation-os/.
