// ─── Remotion Video Studio — agent mesh (Phase 1) ───────────────────────────
// Produces a VideoScript blueprint (the exact shape remotion/VideoEngine + the
// render pipeline already consume) through a chain of small agents under Hermes:
//
//   script-writer → scene-planner → asset-manifest → caption-timing
//                 → template → video-agent → render-qa
//
// Each is registered and invoked via the runner (validated + logged). The
// `runVideoStudio()` coordinator wires them into a Hermes pipeline and returns
// the QA-gated blueprint, ready for the existing render step.
//
// LOCKED UPGRADE 010: 6-scene cinematic structure
//   hook → pain_stack → desire → mechanism → transformation → cta  (do not revert)

import { randomUUID } from 'crypto'
import { callClaudeJSON } from '@/lib/ai/claude'
import type { Agent } from '../types'
import { runPipeline } from '../index'
import { registerAll, hasAgent } from '../registry'

const FPS = 30
const SIX_SCENES = ['hook', 'pain_stack', 'desire', 'mechanism', 'transformation', 'cta'] as const

const VOICE_BY_LANE: Record<string, string> = {
  first_keys_indy: 'nova',
  music_theory_secrets: 'fable',
  colvin_enterprises: 'echo',
}

// Minimal evidence guard (kept local so we don't import the daily-run module).
const BANNED = [/\b\d+% (?:increase|more|growth|roi)\b/i, /guaranteed?\b/i, /\$[\d,]+ (?:in revenue|saved|earned)/i]
function claimIssues(text: string): string[] {
  return BANNED.filter((re) => re.test(text)).map((re) => `possible unverifiable claim: ${re.source}`)
}

// ── Shared types for the studio data flow ───────────────────────────────────
interface StudioInput {
  lane: string
  platform?: string
  hook: string
  transformation?: string
  rung_label?: string
  cta: string
}
interface Scene {
  type: string
  duration_seconds: number
  headline?: string
  body?: string
  caption_text?: string
  pain_points?: string[]
  steps?: Array<{ number: string; title: string; description?: string }>
  before_state?: string
  after_state?: string
  cta_text?: string
}
interface ScriptOut extends StudioInput { title: string; voiceover_script: string; voiceover_voice: string; scenes: Scene[] }

// ── 1) Script Writer (LLM) ──────────────────────────────────────────────────
export const scriptWriterAgent: Agent<StudioInput, ScriptOut> = {
  name: 'remotion.script-writer',
  description: 'Writes the 6-scene cinematic script (hook→pain_stack→desire→mechanism→transformation→cta).',
  kind: 'llm',
  taskType: 'video_script',
  inputSchema: {
    type: 'object', required: ['lane', 'hook', 'cta'],
    properties: { lane: { type: 'string' }, platform: { type: 'string' }, hook: { type: 'string' },
      transformation: { type: 'string' }, rung_label: { type: 'string' }, cta: { type: 'string' } },
  },
  outputSchema: {
    type: 'object', required: ['title', 'voiceover_script', 'voiceover_voice', 'scenes'],
    properties: {
      title: { type: 'string' }, voiceover_script: { type: 'string' }, voiceover_voice: { type: 'string' },
      scenes: { type: 'array', minItems: 6, maxItems: 6 },
    },
  },
  async run(input, ctx) {
    const voice = VOICE_BY_LANE[input.lane] ?? 'echo'
    const system = `You are the Remotion Script Writer for ${input.lane}. Write a 6-scene short-form video using this EXACT cinematic structure (LOCKED — do not change order or count):
1 hook — pattern interrupt, use this hook verbatim
2 pain_stack — 2-3 escalating pain points (array)
3 desire — the hope shift toward the outcome
4 mechanism — 3 solution step cards
5 transformation — before vs after
6 cta — one clear next step

Voice: warm, direct, Indianapolis. NO fabricated stats/clients/ROI — label any outcome "[example]".
Hook (verbatim scene 1): "${input.hook}"
Transformation being sold: "${input.transformation ?? ''}". Offer/rung: ${input.rung_label ?? ''}. CTA: "${input.cta}".

Return ONLY JSON:
{ "title": string, "voiceover_script": string,
  "scenes": [
    { "type":"hook", "duration_seconds":3, "headline":string, "caption_text":string },
    { "type":"pain_stack", "duration_seconds":6, "pain_points":[string], "caption_text":string },
    { "type":"desire", "duration_seconds":5, "headline":string, "body":string, "caption_text":string },
    { "type":"mechanism", "duration_seconds":7, "steps":[{"number":"1","title":string,"description":string}], "caption_text":string },
    { "type":"transformation", "duration_seconds":6, "before_state":string, "after_state":string, "caption_text":string },
    { "type":"cta", "duration_seconds":4, "cta_text":string, "headline":string, "caption_text":string }
  ] }`
    const { json } = await callClaudeJSON<{ title: string; voiceover_script: string; scenes: Scene[] }>({
      taskType: 'video_script', system,
      user: `Write the 6-scene script for ${input.lane}. Keep the hook verbatim. No invented proof.`,
      maxTokensOverride: 2200,
    })
    ctx.log(`scripted ${json.scenes?.length ?? 0} scenes`)
    return { ...input, title: json.title, voiceover_script: json.voiceover_script, voiceover_voice: voice, scenes: json.scenes }
  },
}

// ── 2) Scene Planner (deterministic) — normalize structure + durations ───────
export const scenePlannerAgent: Agent<ScriptOut, ScriptOut & { duration_seconds: number }> = {
  name: 'remotion.scene-planner',
  description: 'Enforces the 6-scene structure, clamps durations, assigns ids, totals runtime.',
  kind: 'deterministic',
  async run(input, ctx) {
    const scenes = SIX_SCENES.map((type, i) => {
      const s = input.scenes.find((x) => x.type === type) ?? input.scenes[i] ?? { type, duration_seconds: 5 }
      const dur = Math.min(15, Math.max(2, Number(s.duration_seconds) || 5))
      return { ...s, type, duration_seconds: dur, id: `scene-${i + 1}-${type}` }
    })
    const duration_seconds = scenes.reduce((a, s) => a + s.duration_seconds, 0)
    ctx.log(`planned ${scenes.length} scenes, ${duration_seconds}s`)
    return { ...input, scenes, duration_seconds }
  },
}

// ── 3) Asset Manifest (deterministic) — describe needed images ───────────────
export const assetManifestAgent: Agent<ScriptOut & { duration_seconds: number }, ScriptOut & { duration_seconds: number }> = {
  name: 'remotion.asset-manifest',
  description: 'Attaches an image asset spec (description + fallback color) to each scene.',
  kind: 'deterministic',
  async run(input, ctx) {
    const scenes = input.scenes.map((s) => {
      const desc = s.headline || s.body || s.cta_text || (s.pain_points && s.pain_points[0]) || s.after_state || `${input.lane} ${s.type}`
      return { ...s, assets: [{ type: 'image', description: `Cinematic ${input.lane} visual: ${desc}`, fallback_color: '#0A1A2F' }] }
    })
    ctx.log(`manifested assets for ${scenes.length} scenes`)
    return { ...input, scenes }
  },
}

// ── 4) Caption Timing (deterministic) — frame-accurate caption track ─────────
export const captionTimingAgent: Agent<ScriptOut & { duration_seconds: number }, ScriptOut & { duration_seconds: number; captions: Array<{ text: string; startFrame: number; endFrame: number }> }> = {
  name: 'remotion.caption-timing',
  description: 'Builds the caption track with frame-accurate start/end times.',
  kind: 'deterministic',
  async run(input, ctx) {
    let frame = 0
    const captions = input.scenes.map((s) => {
      const startFrame = frame
      const endFrame = frame + Math.round(s.duration_seconds * FPS)
      frame = endFrame
      return { text: s.caption_text || s.headline || '', startFrame, endFrame }
    }).filter((c) => c.text)
    ctx.log(`timed ${captions.length} captions @ ${FPS}fps`)
    return { ...input, captions }
  },
}

// ── 5) Template (deterministic) — format + platform routing ──────────────────
export const templateAgent: Agent<{ lane: string; platform?: string }, { format: string; platform: string }> = {
  name: 'remotion.template',
  description: 'Selects aspect ratio + platform for the lane (9:16 short-form default).',
  kind: 'deterministic',
  async run(input, ctx) {
    const platform = input.platform || 'tiktok'
    const format = '9:16'
    ctx.log(`template ${format} / ${platform}`)
    return { format, platform }
  },
}

// ── 6) Video Agent (deterministic) — assemble the full VideoScript blueprint ──
export const videoAgent: Agent<Record<string, unknown>, Record<string, unknown>> = {
  name: 'remotion.video-agent',
  description: 'Assembles the final VideoScript blueprint the renderer consumes.',
  kind: 'deterministic',
  async run(input, ctx) {
    const script = input.script as ScriptOut & { duration_seconds: number; captions: unknown[] }
    const tmpl = input.template as { format: string; platform: string }
    const blueprint = {
      video_id: `${script.lane}-${new Date().toISOString().slice(0, 10)}-${randomUUID().slice(0, 8)}`,
      created_at: new Date().toISOString(),
      brand: script.lane,
      platform: tmpl.platform,
      format: tmpl.format,
      render_format: tmpl.format,
      title: script.title,
      audience: `${script.lane} target audience`,
      goal: 'lead_generation',
      hook: script.hook,
      scenes: script.scenes,
      voiceover_script: script.voiceover_script,
      voiceover_voice: script.voiceover_voice,
      music_direction: 'energetic cinematic underscore',
      music_volume: 0.18,
      captions: script.captions,
      duration_seconds: script.duration_seconds,
      thumbnail_concept: script.title,
      claims_check: { risk_level: 'low', issues: [], reviewed: false },
      approval_required: true,
      render_status: 'draft',
    }
    ctx.log(`assembled blueprint ${blueprint.video_id}`)
    return blueprint
  },
}

// ── 7) Render QA (deterministic) — gate before render ────────────────────────
export const renderQAAgent: Agent<Record<string, unknown>, { ok: boolean; issues: string[]; blueprint: Record<string, unknown> }> = {
  name: 'remotion.render-qa',
  description: 'Validates the blueprint (6-scene structure, durations, voiceover, claims) before render.',
  kind: 'deterministic',
  async run(input, ctx) {
    const bp = input as Record<string, unknown>
    const scenes = (bp.scenes as Scene[]) ?? []
    const issues: string[] = []
    if (scenes.length !== 6) issues.push(`expected 6 scenes, got ${scenes.length}`)
    const types = scenes.map((s) => s.type)
    if (SIX_SCENES.some((t, i) => types[i] !== t)) issues.push(`scene order must be ${SIX_SCENES.join(' → ')}`)
    const total = Number(bp.duration_seconds) || 0
    if (total < 15 || total > 90) issues.push(`total duration ${total}s outside 15–90s`)
    if (!String(bp.voiceover_script || '').trim()) issues.push('empty voiceover_script')
    if (!bp.voiceover_voice) issues.push('missing voiceover_voice')
    issues.push(...claimIssues(String(bp.voiceover_script || '')))
    const ok = issues.length === 0
    ctx.log(ok ? 'QA passed' : `QA found ${issues.length} issue(s)`)
    return { ok, issues, blueprint: bp }
  },
}

export const REMOTION_AGENTS: Agent[] = [
  scriptWriterAgent, scenePlannerAgent, assetManifestAgent, captionTimingAgent,
  templateAgent, videoAgent, renderQAAgent,
]

/** Register all Remotion Studio agents (idempotent). */
export function registerRemotionStudio(): void {
  const unregistered = REMOTION_AGENTS.filter((a) => !hasAgent(a.name))
  if (unregistered.length) registerAll(unregistered)
}

export interface StudioResult { ok: boolean; issues: string[]; blueprint: Record<string, unknown> | null; runId: string }

/**
 * remotion.studio coordinator — runs the studio pipeline through Hermes and
 * returns the QA-gated VideoScript blueprint. The caller hands a passing
 * blueprint to the render step (fetch-assets → generate-audio → remotion render).
 */
export async function runVideoStudio(input: StudioInput): Promise<StudioResult> {
  registerRemotionStudio()
  const result = await runPipeline(
    [
      { agent: 'remotion.script-writer' },
      { agent: 'remotion.scene-planner' },
      { agent: 'remotion.asset-manifest' },
      { agent: 'remotion.caption-timing' },
      // template runs off the original pipeline input, not the previous step:
      { agent: 'remotion.template', map: (_acc, pIn) => pIn },
      // video-agent needs both the timed script and the template choice:
      { agent: 'remotion.video-agent', map: (acc) => ({ script: acc['remotion.caption-timing'], template: acc['remotion.template'] }) },
      { agent: 'remotion.render-qa', map: (acc) => acc['remotion.video-agent'] },
    ],
    input,
    { name: 'remotion.studio', lane: input.lane },
  )

  const qa = result.outputs['remotion.render-qa'] as { ok: boolean; issues: string[]; blueprint: Record<string, unknown> } | undefined
  return {
    ok: Boolean(result.ok && qa?.ok),
    issues: qa?.issues ?? ['pipeline failed before QA'],
    blueprint: qa?.ok ? qa.blueprint : null,
    runId: result.runId,
  }
}
