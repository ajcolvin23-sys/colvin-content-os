// ─── Daily lead-processing pipeline (Hermes) ────────────────────────────────
// The first real gabriel:daily slice expressed as a Hermes pipeline instead of
// inline steps: dedup (step 8) → scoring (step 9). Promoted agents, composed and
// observable. Future batches add lead-finder/enrichment in front and outreach
// behind, until the whole daily run flows through Hermes (Phase 2 finale).

import { runPipeline } from '../index'
import { registerMeshAgents } from '../agents'

export interface ProcessedLeads {
  ok: boolean
  scored: Array<Record<string, unknown>>
  removed: number
  runId: string
}

/** dedup → scoring. Returns review-ready, de-duplicated, sorted leads. */
export async function runDailyLeadPipeline(
  leads: Array<Record<string, unknown>>,
): Promise<ProcessedLeads> {
  registerMeshAgents()
  const result = await runPipeline(
    [
      { agent: 'leads.dedup' },
      // scoring expects { leads }; feed it the deduped set:
      { agent: 'leads.scoring', map: (acc) => ({ leads: (acc['leads.dedup'] as { unique: unknown[] }).unique }) },
    ],
    { leads },
    { name: 'daily-leads' },
  )

  const dedup = result.outputs['leads.dedup'] as { removed: number } | undefined
  const scoring = result.outputs['leads.scoring'] as { scored: Array<Record<string, unknown>> } | undefined
  return {
    ok: result.ok,
    scored: scoring?.scored ?? [],
    removed: dedup?.removed ?? 0,
    runId: result.runId,
  }
}
