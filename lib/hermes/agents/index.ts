// ─── Mesh agent registration hub ────────────────────────────────────────────
// One call registers every real agent in the mesh. Import this wherever you
// need the agents available (daily pipeline, tests, dashboard).

import { registerAgent, hasAgent } from '../registry'
import type { Agent } from '../types'
import { REMOTION_AGENTS } from './remotion'
import { leadScoringAgent, categorizeAgent, leadDedupAgent } from './leads'
import { colvinInfographicAgent, linkedInPostAgent, facebookPostAgent, carouselAgent } from './content'
import { dailyReportAgent } from './report'
import { emailCopyAgent, outreachSequenceAgent } from './outreach'
import { leadFinderAgent } from './research'
import { calendarPlannerAgent } from './calendar'
import { solomonSeoAgent } from './seo'
import { vibeMarketingAgent } from './marketing'
import { FUNNEL_AGENTS } from './funnels'
import { complianceGateAgent } from './gates'

const ALL_AGENTS: Agent[] = [
  ...REMOTION_AGENTS,
  leadFinderAgent,
  solomonSeoAgent,
  vibeMarketingAgent,
  leadScoringAgent,
  categorizeAgent,
  leadDedupAgent,
  colvinInfographicAgent,
  linkedInPostAgent,
  facebookPostAgent,
  carouselAgent,
  dailyReportAgent,
  emailCopyAgent,
  outreachSequenceAgent,
  calendarPlannerAgent,
  ...FUNNEL_AGENTS,
  complianceGateAgent,
]

/** Idempotently register every mesh agent. Safe to call multiple times. */
export function registerMeshAgents(): void {
  for (const a of ALL_AGENTS) if (!hasAgent(a.name)) registerAgent(a)
}

export { ALL_AGENTS }
