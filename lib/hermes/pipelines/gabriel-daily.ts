// ─── Gabriel Daily — Hermes orchestrator (Phase 2 finale, shadow mode) ──────
// Reproduces the content heart of gabriel:daily through the promoted mesh agents
// instead of the inline monolith. Runs in SHADOW until parity is confirmed; the
// live gabriel:daily is untouched. Once a shadow run looks right, flip the default.
//
// Per-lane logic mirrors step 5:
//   colvin (linkedin_visual_studio) → infographic
//   else → linkedin base post; +facebook (if fb); +carousel (if linkedin); +video (if tiktok)
// Then: seo.solomon (focus lane) → marketing.vibe → report.daily.

import { randomUUID } from 'crypto'
import * as path from 'path'
import { runAgent } from '../runner'
import { registerMeshAgents } from '../agents'
import { runVideoStudio } from '../agents/remotion'

interface LaneStrategy {
  platforms?: string[]
  content_mode?: string
  hooks?: string[]
  transformation?: string
  rung_label?: string
  focus_note?: string
  cta?: string
  cta_buyers?: string
}

export interface GabrielMeshOptions {
  activeLanes: string[]
  strategy: Record<string, LaneStrategy>
  model: string
  lanes?: string[]        // subset to run (default: all active)
  genVideo?: boolean      // render video for tiktok lanes (default true)
  outDir?: string         // infographic output dir
}

export interface MeshDraft { lane: string; platform: string; type: string; chars?: number; ref?: string }

export interface GabrielMeshResult {
  runId: string
  drafts: MeshDraft[]
  seo: { lane: string; opportunities: string[] } | null
  recommendations: string[]
  report: unknown
  errors: string[]
}

export async function runGabrielDailyMesh(opts: GabrielMeshOptions): Promise<GabrielMeshResult> {
  registerMeshAgents()
  const runId = randomUUID()
  const lanes = opts.lanes ?? opts.activeLanes
  const genVideo = opts.genVideo !== false
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  const drafts: MeshDraft[] = []
  const errors: string[] = []

  console.log(`\n╔═ Gabriel Daily (Hermes mesh, shadow) — ${lanes.length} lane(s) ═╗`)

  for (const lane of lanes) {
    const s = opts.strategy[lane] ?? {}
    const platforms = s.platforms ?? []
    if (platforms.length === 0 && s.content_mode !== 'linkedin_visual_studio') {
      console.log(`  [${lane}] no platforms — skipped (matches inline behavior)`)
      continue
    }
    const hook = s.hooks?.length ? s.hooks[dayOfYear % s.hooks.length] : 'Most people have this wrong.'
    const cta = s.cta ?? s.cta_buyers ?? 'Learn more'

    try {
      // Colvin visual studio → infographic
      if (s.content_mode === 'linkedin_visual_studio') {
        const r = await runAgent<{ title: string; pngPath: string }>('content.colvin-infographic', {
          model: opts.model, cta, dateStr: new Date().toISOString().slice(0, 10),
          outDir: opts.outDir ?? path.resolve(process.cwd(), 'out/colvin-previews'),
        }, { runId, lane })
        if (r.ok) drafts.push({ lane, platform: 'linkedin', type: 'infographic', ref: r.output!.pngPath })
        else errors.push(`${lane} infographic: ${r.error}`)
        continue
      }

      // Base LinkedIn post (always generated as the content base, like the monolith)
      const li = await runAgent<{ draft: string; character_count: number }>('content.linkedin-post', {
        lane, hook, transformation: s.transformation, rungLabel: s.rung_label, focusNote: s.focus_note, cta,
      }, { runId, lane })
      const liDraft = li.ok ? li.output!.draft : ''
      if (li.ok && platforms.includes('linkedin')) drafts.push({ lane, platform: 'linkedin', type: 'post', chars: li.output!.character_count })

      if (platforms.includes('facebook') && liDraft) {
        const fb = await runAgent<{ draft: string }>('content.facebook-post', { linkedinDraft: liDraft, cta }, { runId, lane })
        if (fb.ok) drafts.push({ lane, platform: 'facebook', type: 'post', chars: fb.output!.draft.length })
      }
      if (platforms.includes('linkedin')) {
        const car = await runAgent<{ slides: unknown[] }>('content.carousel', { lane, hook, transformation: s.transformation, rungLabel: s.rung_label, cta }, { runId, lane })
        if (car.ok) drafts.push({ lane, platform: 'linkedin', type: 'carousel' })
      }
      if (platforms.includes('tiktok') && genVideo) {
        const studio = await runVideoStudio({ lane, platform: 'tiktok', hook, transformation: s.transformation, rung_label: s.rung_label, cta })
        if (studio.ok) drafts.push({ lane, platform: 'tiktok', type: 'video_script', ref: String((studio.blueprint as { video_id?: string })?.video_id) })
        else errors.push(`${lane} video: ${studio.issues.join('; ')}`)
      }
    } catch (e) {
      errors.push(`${lane}: ${String(e).slice(0, 120)}`)
    }
  }

  // SEO (focus lane) + marketing recs
  const focusLane = lanes[new Date().getDay() % lanes.length] ?? lanes[0]
  let seo: GabrielMeshResult['seo'] = null
  if (process.env.BRAVE_SEARCH_API_KEY) {
    const seoRun = await runAgent<{ opportunities: string[] }>('seo.solomon', { lane: focusLane, query: `${focusLane.replace(/_/g, ' ')} Indianapolis` }, { runId, lane: focusLane })
    if (seoRun.ok) seo = { lane: focusLane, opportunities: seoRun.output!.opportunities }
  }
  const vibe = await runAgent<{ recommendations: string[] }>('marketing.vibe', { activeLanes: opts.activeLanes, focusLane, seoReports: seo ? [{ lane: seo.lane, opportunities: seo.opportunities }] : [] }, { runId, lane: focusLane })

  const report = await runAgent('report.daily', {
    rawLeadsCount: 0, uniqueLeadsCount: 0, outreach: [], contentCount: drafts.length, seoCount: seo?.opportunities.length ?? 0,
    top3: vibe.output?.recommendations ?? [], errors,
  }, { runId })

  console.log(`╚═ mesh run ${runId.slice(0, 8)}: ${drafts.length} drafts, ${errors.length} errors ═╝\n`)
  return { runId, drafts, seo, recommendations: vibe.output?.recommendations ?? [], report: report.output, errors }
}
