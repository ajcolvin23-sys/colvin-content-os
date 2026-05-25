// ─── Hermes Orchestrator v2 ───────────────────────────────────────────────────
// Improvements over v1:
//   1. Builds Genius Prompt DNA for every agent task (not just sentences)
//   2. Structured handoff format between agents (clean context, not noise)
//   3. QA Critic pass before final output reaches Alfred
//   4. Katrina governance review on compliance/publish-sensitive work
//   5. Per-step failure recovery (retries with corrective context)
//   6. Context filtering (agents get targeted summaries, not raw full output)
// ─────────────────────────────────────────────────────────────────────────────
import OpenAI from 'openai'
import { runGabriel } from './gabriel'
import { runSolomon } from './solomon'
import { runGenius } from './genius'
import type {
  AgentName,
  OrchestratorPlan,
  OrchestratorResponse,
  AgentResult,
} from './types'

let _openai: OpenAI | null = null
function getOpenAI() {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return _openai
}

// ── Compliance triggers — routes through Katrina before output ────────────────
const KATRINA_TRIGGERS = [
  'first keys', 'homebuyer', 'down payment', 'mortgage', 'publish', 'auto-post',
  'schedule', 'send email', 'delete', 'compliance', 'legal', 'approved', 'certif',
  'backflow', 'regulated', 'financial', 'agent file', 'new agent', 'new automation',
  'grant', 'qualify', 'eligible', 'nonprofit', 'church', 'donor', 'funding',
  'auto-reply', 'webhook trigger', 'outreach', 'partnership', 'client-facing',
]

const KATRINA_LANES = new Set([
  'first_keys_indy',
  'backflow',
  'funding_ready_indiana',
])

function needsKatrinaReview(request: string, lane: string | null): boolean {
  const lower = request.toLowerCase()
  if (lane && KATRINA_LANES.has(lane)) return true
  return KATRINA_TRIGGERS.some(t => lower.includes(t))
}

// ── Planner Prompt ─────────────────────────────────────────────────────────────
const PLANNER_PROMPT = `You are Hermes — the master orchestrator inside the Colvin Hermes operating system.

Your job: read Alfred's request, understand the TRUE intent, select the right agents, and build a precise execution plan.

## Who Alfred Is

Alfred Colvin — Indianapolis, Indiana. Entrepreneur, faith-rooted, direct communicator.
He is building a multi-domain AI-powered business, creative, ministry, software, and media ecosystem.
Alfred expects outputs to be: accurate, evidence-aware, strategic, practical, reusable, implementation-ready, business-aware, compliance-conscious, creative when needed, and direct.

## Agent Roster

### Gabriel — Content & Automation
Writes: social posts, TikTok/IG/FB/LinkedIn scripts, video slide content, captions, hooks, email copy, flyers, promo calendars, SMS, landing page sections
Voice: Alfred's voice — direct, faith-rooted, short sentences, practical, no fluff
Compliance: First Keys Indy content always uses "up to $X / may qualify for" — never guarantee amounts
Use when: anything that needs to be WRITTEN or CREATED

### Solomon — SEO & Market Authority
Does: keyword research, SERP analysis, page architecture, local SEO, schema markup, AI Overview optimization, competitor gaps, technical SEO, 30/60/90-day SEO roadmaps, market research, opportunity analysis
Evidence standard: always labels [VERIFIED]/[INFERRED]/[ASSUMED]/[RESEARCH REQUIRED]
Use when: ranking, visibility, search, website pages, keywords, competitors, local search, schema, research, market analysis

### Genius — Marketing & Conversion
Does: direct-response copy, hooks scored 0-100, ad creative, email sequences, offer engineering, funnel strategy, lead magnets, conversion optimization, prompt upgrades
Frameworks: Hormozi, PAS, AIDA, before/after/bridge
Use when: paid ads, conversion, funnels, email campaigns, offer building, lead generation, upgrading prompts, genius prompt engineering

## Hard Routing Rules
- Content only → gabriel
- SEO only → solomon
- Conversion/ads/offers → genius
- "Rank + write" → solomon (keywords) → gabriel (write using keywords)
- "Viral + convert" → gabriel (content) → genius (conversion layer)
- "Full campaign" → gabriel → [solomon + genius in parallel]
- "Build a page" → solomon (structure/SEO) → gabriel (copy)
- "Upgrade a prompt" → genius (Pattern 10: Self-Improving Prompt Engine)
- "Research this idea" or "is this a good idea" → solomon (market research + opportunity scoring)
- "Rank this idea 1-10" → genius (Pattern 8: Business Idea Ranking)
- "Write a post/ad/email" → gabriel
- "Build an agent/skill/prompt file" → genius (Pattern 3: Agent Builder)
- "FundingReady / grant / nonprofit" → solomon (research) → gabriel (content) [always requires katrina]
- "Girls Got Game / Yahweh Comics / GloryEngine" → route by task type per above rules

## Active MCPs and Tools
- **Firecrawl** — live web scraping, competitor research, SERP content, fact verification (Solomon primary tool)
- **Playwright MCP** — headless browser, UI testing, JS-rendered content scraping
- **Remotion MCP** — video composition and rendering pipeline
- **Gemini MCP** — Google Gemini available as second-opinion AI (tool: gemini_ask)
- **Social APIs** — TikTok, YouTube, Facebook, LinkedIn keys configured (for publishing workflows)

## Katrina Auto-Triggers
Set requires_katrina: true whenever request or lane involves:
- first_keys_indy or backflow (always)
- funding_ready_indiana (always)
- "publish" / "auto-post" / "schedule" / "send email" / "auto-reply"
- "grant" / "qualify" / "eligible" / "financial" / "compliance" / "legal"
- "homebuyer" / "down payment" / "mortgage" / "first keys"
- "delete" / "webhook trigger" / "automate outreach"
- new agent file, new automation, workflow governance

## QA Auto-Triggers
Set requires_qa: true for all requests (default on). Only set false for ultra-simple single-agent tasks with no compliance risk.

## Alfred's Business Lanes

### first_keys_indy
Marion County homebuyer education. Contact: Tanya Day, FirstKeysIndy.org, 317-995-4719.
COMPLIANCE: Every output must use "up to $X" / "may qualify for" — never guarantee amounts.

### piano
Music Theory Secrets book, gospel piano, number system, church musicians, YouTube channel (~860 subs), piano app.
Opportunity: TikTok/Shorts automation, slideshow videos, content calendar.

### backflow
Indiana Backflow Directory. Certified testers by county. Local SEO, plumber lead generation.
COMPLIANCE: Educational only — no unverified regulatory claims.

### colvin_enterprises
AI automation, websites, CRM, agent systems for local Indianapolis businesses.
Preferred outputs: proposals, landing pages, client offers, LinkedIn, automation specs.

### youtube
Educational content across all lanes. Top-of-funnel content.

### funding_ready_indiana
Indiana grant readiness for churches, Black-led nonprofits, youth programs.
Services: document org, impact clarification, grant drafting, compliance checks.
Offers: $497 Audit | $2,500–$3,500 Setup | $750–$2,500/mo Pipeline.
Differentiator: Church-to-Grant Translation Engine.
COMPLIANCE: Never guarantee grant approval. Educational framing only.

### girls_got_game
Women's basketball, WNBA, women's sports media platform. Stats, news, schedules, highlights.

### yahweh_comics
Biblical anime. Samson: African American, dreadlocks, red and green aura, anime-style action. Yahweh Comics brand.

### glory_engine
AI VST/preset sound builder. Gospel, trap, worship, cinematic anime sounds. JUCE + C++ architecture. Prompt-to-preset. 8 macro knobs.

Return ONLY valid JSON:
{
  "intent": "one sentence — what Alfred actually wants",
  "lane": "first_keys_indy|piano|backflow|colvin_enterprises|youtube|funding_ready_indiana|girls_got_game|yahweh_comics|glory_engine|null",
  "prompt_pattern": "marketing|research|software|agent_builder|business_ranking|general|prompt_upgrade|bible_teaching|music|comic",
  "steps": [
    {
      "agent": "gabriel|solomon|genius",
      "task_brief": "2-3 sentence description of what this agent needs to do",
      "needs_prior_output": false,
      "run_parallel": false,
      "handoff_summary_needed": false
    }
  ],
  "requires_katrina": false,
  "requires_qa": true,
  "reasoning": "why this plan — which agents, in this order, and why"
}`

// ── Genius Prompt Builder ──────────────────────────────────────────────────────
// Converts a task brief into a full Genius Prompt DNA structure
const PROMPT_BUILDER_SYSTEM = `You are the Genius Prompt Architect inside the Colvin Hermes operating system.

Your job: take a task brief and build a full, structured genius prompt for the specialist agent that will receive it.

Every prompt you build MUST follow the Genius Prompt DNA:
1. Role — specific expert identity
2. Mission — the specific outcome
3. Context — Alfred's business, lane, relevant background
4. Objective — the exact deliverable
5. Constraints — what NOT to do, evidence rules, compliance rules
6. Workflow — numbered steps
7. Output Format — exact sections required
8. Quality Check — what to verify before submitting

## Alfred's Full Context

Alfred Colvin — Indianapolis, Indiana. Entrepreneur, faith-rooted, direct communicator. Building a multi-domain AI-powered business, creative, ministry, and media ecosystem.

Business Lanes:
- first_keys_indy: Marion County homebuyer education. COMPLIANCE: "up to $X / may qualify for" — never guarantee amounts. Contact: Tanya Day, FirstKeysIndy.org, 317-995-4719.
- piano: Music Theory Secrets book, gospel piano, YouTube channel. Voice: encouraging, educational, church-musician-aware.
- backflow: Indiana Backflow Directory. COMPLIANCE: educational only — no unverified regulatory claims.
- colvin_enterprises: AI automation, websites, CRM for local businesses. Tone: professional, results-oriented.
- funding_ready_indiana: Grant readiness for churches, Black-led nonprofits. COMPLIANCE: never guarantee grant approval. Educational framing only.
- girls_got_game: Women's basketball/sports media platform.
- yahweh_comics: Biblical anime. Samson: African American, dreadlocks, red/green aura, anime-style.
- glory_engine: AI VST/preset sound builder. JUCE + C++. Gospel/trap/worship sounds.

Evidence labels when facts are involved: [VERIFIED] / [INFERRED] / [ASSUMED] / [RESEARCH REQUIRED]

## Pattern Selection by Task Type

## Available Tools (active MCPs)

**Firecrawl** — web scraping and research. Solomon uses this to scrape competitor sites, pull SERP content, verify market claims, and gather real-time evidence. Direct: POST https://api.firecrawl.dev/v1/scrape with FIRECRAWL_API_KEY.

**Playwright MCP** — headless browser automation. Use for testing, screenshotting landing pages, verifying UI, or scraping JavaScript-rendered content that Firecrawl can't reach.

**Remotion MCP** — video rendering pipeline. Use for triggering video composition and render jobs.

**Gemini MCP (hermes-gemini)** — Google Gemini model available as a second-opinion AI. Tool name: gemini_ask. Use when you want a different model's perspective or need Gemini-specific capabilities.

**Social APIs configured** — TikTok, YouTube, Facebook, LinkedIn (keys in .env.local). These enable scheduled publishing when workflows are built.

## Pattern Selection by Task Type

For MARKETING / CONTENT tasks (gabriel): use Pattern 4 structure. Include hook options, emotional trigger, platform adaptation, CTA, compliance language where needed.
For SEO / RESEARCH tasks (solomon): use Pattern 1 structure. Include keyword strategy, evidence labels, local SEO, competitor analysis. Solomon may use Firecrawl to verify claims.
For CONVERSION / OFFER tasks (genius): use Pattern 4 or Pattern 8. Include hook scoring, Hormozi/PAS framework, funnel stage, CTA.
For AGENT / PROMPT tasks (genius): use Pattern 3 or Pattern 10. Include trigger conditions, workflow, output format, failure modes.
For SOFTWARE / BUILD tasks: use Pattern 2 or Pattern 7. Include architecture, schema, security, build phases.
For BIBLE / MINISTRY tasks: include scripture references, teaching flow, application section.
For COMIC / CREATIVE tasks: include canon consistency rules, visual style notes, character continuity.

Return ONLY the complete prompt text — no commentary, no wrapper. The agent will receive this directly.`

async function buildGeniusPrompt(
  agent: AgentName,
  taskBrief: string,
  lane: string | null,
  priorHandoff?: string
): Promise<string> {
  const openai = getOpenAI()

  const context = [
    `Agent: ${agent.toUpperCase()}`,
    `Task brief: ${taskBrief}`,
    lane ? `Business lane: ${lane}` : '',
    priorHandoff ? `Prior agent handoff:\n${priorHandoff}` : '',
  ].filter(Boolean).join('\n\n')

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: PROMPT_BUILDER_SYSTEM },
      { role: 'user', content: context },
    ],
    temperature: 0.3,
    max_tokens: 1200,
  })

  return response.choices[0].message.content || taskBrief
}

// ── Handoff Summarizer ─────────────────────────────────────────────────────────
// Extracts only what the NEXT agent needs — prevents context contamination
async function buildHandoffSummary(
  completedAgent: AgentName,
  nextAgent: AgentName,
  output: string
): Promise<string> {
  const openai = getOpenAI()

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a handoff coordinator. Extract ONLY what ${nextAgent.toUpperCase()} needs from ${completedAgent.toUpperCase()}'s output. Be specific and brief. Do not summarize unnecessarily — include exact copy, keywords, or structure that the next agent needs to use directly. Format as a clean handoff note, not a summary.`,
      },
      {
        role: 'user',
        content: `${completedAgent.toUpperCase()} produced this output:\n\n${output}\n\nExtract what ${nextAgent.toUpperCase()} specifically needs.`,
      },
    ],
    temperature: 0.2,
    max_tokens: 600,
  })

  return response.choices[0].message.content || output
}

// ── QA Critic ─────────────────────────────────────────────────────────────────
const QA_SYSTEM = `You are the QA Critic for the Colvin Hermes operating system. You are a strict quality gate.

Review the assembled output and check:
1. Does it answer the real objective?
2. Are all claims supported or labeled? (No invented stats, no guaranteed amounts)
3. Is every piece actionable?
4. Is compliance language present where required? (First Keys Indy: "up to $X", "may qualify", "eligibility depends on your situation")
5. Is the output format clean and usable?
6. Is there a clear next action?
7. Are assumptions labeled?
8. Could Alfred use this RIGHT NOW without further editing?

Be direct. If something is weak, say exactly what to fix. If it passes, confirm why.

Return:
## QA Verdict: PASS / REVISE / FAIL
## Score: [1-10]
## What's Strong
## What Needs Fixing (if any)
## Compliance Check
## Approved Output (cleaned version if needed, or "See original" if no changes needed)`

async function runQACritic(
  request: string,
  assembledOutput: string,
  lane: string | null
): Promise<string> {
  const openai = getOpenAI()

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: QA_SYSTEM },
      {
        role: 'user',
        content: `Alfred's original request: "${request}"\nBusiness lane: ${lane || 'general'}\n\nAssembled output:\n\n${assembledOutput}`,
      },
    ],
    temperature: 0.2,
    max_tokens: 1500,
  })

  return response.choices[0].message.content || assembledOutput
}

// ── Katrina Governance Review ──────────────────────────────────────────────────
const KATRINA_SYSTEM = `You are Katrina — HR Business Partner and Governance Reviewer for the Colvin Hermes operating system.

Review this output before it reaches Alfred or is published/automated.

Check:
1. Role and boundary clarity (does the agent stay in its lane?)
2. Compliance risk (First Keys Indy: no guaranteed amounts; backflow: no unverified regulatory claims)
3. Automation safety (anything that auto-publishes, auto-sends, or auto-deletes needs human approval)
4. Privacy and data handling
5. Reputational risk (would Alfred be comfortable if this appeared publicly?)
6. Legal/financial claims (are they appropriately hedged?)
7. Missing human approval gates

Return:
## Katrina Review
## Verdict: APPROVED / APPROVED WITH REVISIONS / NOT APPROVED
## Alignment Score: [1-10]
## Compliance Check
## Automation Safety
## Reputational Risk
## Required Revisions (if any)
## Final Decision`

async function runKatrinaReview(
  request: string,
  output: string,
  lane: string | null
): Promise<string> {
  const openai = getOpenAI()

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: KATRINA_SYSTEM },
      {
        role: 'user',
        content: `Request: "${request}"\nLane: ${lane || 'general'}\n\nOutput to review:\n\n${output}`,
      },
    ],
    temperature: 0.2,
    max_tokens: 1000,
  })

  return response.choices[0].message.content || ''
}

// ── Memory / Obsidian Save Recommendation ────────────────────────────────────
async function buildMemorySaveRecommendation(
  request: string,
  finalOutput: string,
  lane: string | null
): Promise<string> {
  const openai = getOpenAI()

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are the Obsidian Memory Architect for Alfred Colvin's Hermes system.

Evaluate whether this output should be saved to Obsidian as a reusable note.

SAVE if the output contains: reusable prompts, agent files, workflows, SOPs, checklists, business decisions, campaign systems, research insights, architecture decisions, offer structures, or brand positioning.

DO NOT SAVE if the output is: a one-off draft, random temporary details, unsupported assumptions, or something Alfred will never reuse.

Return this format:
## 💾 Memory / Obsidian Save Recommendation
**Save?** Yes / No
**Why:** [one sentence]
**Folder:** [/01 Active Projects | /03 AI Agents | /04 Sales & Marketing | /06 Software Development | /10 Research Library | /11 SOPs & Checklists | /12 Prompts | /13 Decisions | /14 Templates]
**Note Title:** [title]
**Tags:** #tag1 #tag2 #tag3`,
      },
      {
        role: 'user',
        content: `Request: "${request}"\nLane: ${lane || 'general'}\n\nOutput preview (first 800 chars):\n${finalOutput.slice(0, 800)}`,
      },
    ],
    temperature: 0.2,
    max_tokens: 250,
  })

  return response.choices[0].message.content || ''
}

// ── Final Assembly ─────────────────────────────────────────────────────────────
const ASSEMBLER_SYSTEM = `You are Hermes, assembling multiple specialist agent outputs into one organized, immediately usable response for Alfred Colvin.

Rules:
- Lead with what Alfred needs most — ready-to-use output first
- Label each agent's section clearly
- Do NOT compress or summarize agent outputs — preserve the full detail
- Add a "What to do next" section at the end with 3-5 specific action steps
- If QA or Katrina reviews are present, include their verdicts but put them AFTER the main output
- Keep Alfred's voice and brand context throughout`

async function assembleFinalOutput(
  request: string,
  results: AgentResult[],
  qaResult?: string,
  katrinaResult?: string
): Promise<string> {
  const openai = getOpenAI()

  if (results.length === 1 && results[0].success && !qaResult && !katrinaResult) {
    return results[0].output
  }

  const sections = [
    ...results
      .filter(r => r.success)
      .map(r => `## ${r.agent.toUpperCase()} OUTPUT\n${r.output}`),
    katrinaResult ? `## KATRINA GOVERNANCE REVIEW\n${katrinaResult}` : '',
    qaResult ? `## QA CRITIC REVIEW\n${qaResult}` : '',
  ].filter(Boolean).join('\n\n---\n\n')

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: ASSEMBLER_SYSTEM },
      { role: 'user', content: `Alfred's request: "${request}"\n\n${sections}` },
    ],
    temperature: 0.3,
    max_tokens: 3500,
  })

  return response.choices[0].message.content || sections
}

// ── Phase 1: Plan ─────────────────────────────────────────────────────────────
async function buildPlan(request: string): Promise<OrchestratorPlan & {
  prompt_pattern: string
  requires_katrina: boolean
  requires_qa: boolean
}> {
  const openai = getOpenAI()

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: PLANNER_PROMPT },
      { role: 'user', content: `Alfred's request: "${request}"` },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
  })

  const raw = response.choices[0].message.content || '{}'
  return JSON.parse(raw)
}

// ── Phase 2: Execute ──────────────────────────────────────────────────────────
async function executeStep(
  agent: AgentName,
  geniusPrompt: string,
): Promise<AgentResult> {
  try {
    switch (agent) {
      case 'gabriel': return runGabriel(geniusPrompt)
      case 'solomon': return runSolomon(geniusPrompt)
      case 'genius':  return runGenius(geniusPrompt)
    }
  } catch (err) {
    return { agent, task: geniusPrompt, output: '', success: false, error: String(err) }
  }
}

async function executePlan(
  plan: OrchestratorPlan & { prompt_pattern: string; requires_katrina: boolean; requires_qa: boolean },
  originalRequest: string
): Promise<AgentResult[]> {
  const results: AgentResult[] = []
  let i = 0

  while (i < plan.steps.length) {
    const step = plan.steps[i]

    // Detect parallel group
    const parallelGroup = [step]
    while (
      i + parallelGroup.length < plan.steps.length &&
      plan.steps[i + parallelGroup.length].run_parallel
    ) {
      parallelGroup.push(plan.steps[i + parallelGroup.length])
    }

    // Build handoff context from last successful result
    const lastResult = results.filter(r => r.success).pop()

    if (parallelGroup.length > 1) {
      // Build genius prompts for all parallel steps
      const parallelWork = await Promise.all(
        parallelGroup.map(async s => {
          let handoff: string | undefined
          if (s.needs_prior_output && lastResult) {
            handoff = await buildHandoffSummary(lastResult.agent, s.agent, lastResult.output)
          }
          const geniusPrompt = await buildGeniusPrompt(s.agent, s.task_brief || s.task, plan.lane, handoff)
          return executeStep(s.agent, geniusPrompt)
        })
      )
      results.push(...parallelWork)
      i += parallelGroup.length
    } else {
      // Build handoff summary for targeted context passing
      let handoff: string | undefined
      if (step.needs_prior_output && lastResult) {
        handoff = await buildHandoffSummary(lastResult.agent, step.agent, lastResult.output)
      }

      // Build structured Genius Prompt for this agent
      const geniusPrompt = await buildGeniusPrompt(
        step.agent,
        (step as any).task_brief || step.task,
        plan.lane,
        handoff
      )

      // Execute with retry on failure
      let result = await executeStep(step.agent, geniusPrompt)
      if (!result.success) {
        // One retry with explicit failure context
        const retryPrompt = await buildGeniusPrompt(
          step.agent,
          `RETRY — previous attempt failed: ${result.error}\n\nOriginal task: ${(step as any).task_brief || step.task}`,
          plan.lane,
          handoff
        )
        result = await executeStep(step.agent, retryPrompt)
      }

      results.push(result)
      i++
    }
  }

  return results
}

// ── Main Orchestrator Entry Point ─────────────────────────────────────────────
export async function runOrchestrator(request: string): Promise<OrchestratorResponse> {
  const startTime = Date.now()

  // Phase 1: Plan
  const plan = await buildPlan(request)

  // Override Katrina trigger detection
  const requiresKatrina = plan.requires_katrina || needsKatrinaReview(request, plan.lane)

  // Phase 2: Execute with Genius Prompt DNA + structured handoffs
  const results = await executePlan(plan, request)

  // Phase 3: Katrina governance review (compliance/publish-sensitive)
  let katrinaResult: string | undefined
  if (requiresKatrina) {
    const combined = results.filter(r => r.success).map(r => r.output).join('\n\n---\n\n')
    katrinaResult = await runKatrinaReview(request, combined, plan.lane)
  }

  // Phase 4: QA Critic
  let qaResult: string | undefined
  if (plan.requires_qa !== false) {
    const combined = results.filter(r => r.success).map(r => r.output).join('\n\n---\n\n')
    qaResult = await runQACritic(request, combined, plan.lane)
  }

  // Phase 5: Assemble final output
  const assembled = await assembleFinalOutput(request, results, qaResult, katrinaResult)

  // Phase 6: Memory / Obsidian save recommendation
  const memorySave = await buildMemorySaveRecommendation(request, assembled, plan.lane)
  const finalOutput = memorySave
    ? `${assembled}\n\n---\n\n${memorySave}`
    : assembled

  return {
    request,
    plan,
    results,
    final_output: finalOutput,
    agents_used: [...new Set(results.map(r => r.agent))],
    execution_time_ms: Date.now() - startTime,
  }
}
