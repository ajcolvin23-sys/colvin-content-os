// ─── Report agent (promoted from gabriel:daily step 13) ─────────────────────
// Deterministic assembler of the daily report summary + review-queue counts.
// Faithful re-expression of step 13's report object (minus file/IO side effects,
// which stay with the caller).

import type { Agent } from '../types'

interface ReportInput {
  rawLeadsCount: number
  uniqueLeadsCount: number
  outreach: Array<{ priority_score: number }>
  contentCount: number
  seoCount: number
  top3?: unknown[]
  errors?: string[]
  skippedLanes?: string[]
}

interface DailyReport {
  date: string
  summary: {
    leads_found: number
    leads_after_dedup: number
    leads_queued_for_review: number
    outreach_drafts_created: number
    content_drafts_created: number
    seo_opportunities_found: number
  }
  top_3_actions: unknown[]
  review_queue: { outreach: number; content: number; seo: number; opportunities: number }
  errors: string[]
  skipped_lanes: string[]
}

export const dailyReportAgent: Agent<ReportInput, DailyReport> = {
  name: 'report.daily',
  description: 'Assembles the daily report summary + review-queue counts. (gabriel:daily step 13)',
  kind: 'deterministic',
  inputSchema: {
    type: 'object',
    required: ['rawLeadsCount', 'uniqueLeadsCount', 'outreach', 'contentCount', 'seoCount'],
    properties: {
      rawLeadsCount: { type: 'number' }, uniqueLeadsCount: { type: 'number' },
      outreach: { type: 'array' }, contentCount: { type: 'number' }, seoCount: { type: 'number' },
      top3: { type: 'array' }, errors: { type: 'array' }, skippedLanes: { type: 'array' },
    },
  },
  outputSchema: {
    type: 'object', required: ['date', 'summary', 'review_queue'],
    properties: { date: { type: 'string' }, summary: { type: 'object' }, review_queue: { type: 'object' } },
  },
  async run(input, ctx) {
    const queued = input.outreach.filter((d) => Number(d.priority_score) >= 7).length
    const report: DailyReport = {
      date: new Date().toISOString().slice(0, 10),
      summary: {
        leads_found: input.rawLeadsCount,
        leads_after_dedup: input.uniqueLeadsCount,
        leads_queued_for_review: queued,
        outreach_drafts_created: input.outreach.length,
        content_drafts_created: input.contentCount,
        seo_opportunities_found: input.seoCount,
      },
      top_3_actions: input.top3 ?? [],
      review_queue: { outreach: queued, content: input.contentCount, seo: input.seoCount, opportunities: 0 },
      errors: input.errors ?? [],
      skipped_lanes: input.skippedLanes ?? [],
    }
    ctx.log(`report: ${report.summary.leads_found} leads, ${report.summary.content_drafts_created} content, ${queued} queued`)
    return report
  },
}
