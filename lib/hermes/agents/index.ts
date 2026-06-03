// ─── Mesh agent registration hub ────────────────────────────────────────────
// One call registers every real agent in the mesh. Import this wherever you
// need the agents available (daily pipeline, tests, dashboard).

import { registerAgent, hasAgent } from '../registry'
import type { Agent } from '../types'
import { REMOTION_AGENTS } from './remotion'
import { leadScoringAgent, categorizeAgent, leadDedupAgent } from './leads'
import { colvinInfographicAgent, linkedInPostAgent, facebookPostAgent, carouselAgent } from './content'
import { dailyReportAgent } from './report'
import { emailCopyAgent } from './outreach'
import { leadFinderAgent } from './research'
import { solomonSeoAgent } from './seo'
import { vibeMarketingAgent } from './marketing'

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
]

/** Idempotently register every mesh agent. Safe to call multiple times. */
export function registerMeshAgents(): void {
  for (const a of ALL_AGENTS) if (!hasAgent(a.name)) registerAgent(a)
}

export { ALL_AGENTS }
