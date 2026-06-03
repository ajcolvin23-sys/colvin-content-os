// ─── Compliance gate (Phase 3 — standalone shared gate) ─────────────────────
// Reusable approval gate: scans copy for CAN-SPAM / HUD-RESPA / unverifiable
// claims / youth-safety issues before anything reaches the review queue.
// Deterministic first pass (fast, free); escalates risk wording.

import type { Agent } from '../types'

const RULES: Array<{ re: RegExp; issue: string; risk: 'medium' | 'high' }> = [
  { re: /guarantee(d|s)?\b/i, issue: 'guarantee language (unverifiable claim)', risk: 'high' },
  { re: /\b\d+% (?:increase|more|growth|roi|approval)\b/i, issue: 'unverifiable percentage claim', risk: 'high' },
  { re: /\$[\d,]+ (?:saved|earned|in revenue|profit)/i, issue: 'unverifiable money claim', risk: 'high' },
  { re: /free money|no risk|risk[- ]free/i, issue: 'prohibited "free money / risk-free" framing', risk: 'high' },
  { re: /guaranteed approval|pre[- ]?approved/i, issue: 'HUD/RESPA: implied guaranteed approval', risk: 'high' },
  { re: /act now|limited time|hurry|don'?t miss/i, issue: 'pushy urgency (CAN-SPAM tone risk)', risk: 'medium' },
  { re: /\bkids?\b|\bminors?\b|under 18/i, issue: 'youth reference — verify youth-safety policy', risk: 'medium' },
  { re: /unsubscribe/i, issue: 'check unsubscribe handling (CAN-SPAM)', risk: 'medium' },
]

interface GateInput { text: string; lane?: string }
interface GateOutput { passed: boolean; risk_level: 'low' | 'medium' | 'high'; issues: string[] }

export const complianceGateAgent: Agent<GateInput, GateOutput> = {
  name: 'gate.compliance',
  description: 'Scans copy for CAN-SPAM / HUD-RESPA / claims / youth-safety issues before review.',
  kind: 'deterministic',
  inputSchema: { type: 'object', required: ['text'], properties: { text: { type: 'string' }, lane: { type: 'string' } } },
  outputSchema: { type: 'object', required: ['passed', 'risk_level', 'issues'], properties: { passed: { type: 'boolean' }, risk_level: { type: 'string' }, issues: { type: 'array' } } },
  async run(input, ctx) {
    const hits = RULES.filter((r) => r.re.test(input.text))
    const issues = hits.map((h) => h.issue)
    const risk_level: GateOutput['risk_level'] = hits.some((h) => h.risk === 'high') ? 'high' : hits.length ? 'medium' : 'low'
    const passed = risk_level !== 'high'
    ctx.log(`${risk_level} risk, ${issues.length} issue(s)`)
    return { passed, risk_level, issues }
  },
}
