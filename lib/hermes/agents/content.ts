// ─── Content agents (promoted from gabriel:daily step 5) ────────────────────
// Wraps the Colvin infographic engine as a mesh agent so it's individually
// callable, validated, and observable. The underlying generator is unchanged.

import type { Agent } from '../types'
import { generateColvinInfographic } from '@/automation-os/scripts/gen-colvin-infographic'

interface InfographicInput { model: string; cta: string; dateStr: string; outDir: string }
interface InfographicOutput { pngPath: string; htmlPath: string; title: string }

export const colvinInfographicAgent: Agent<InfographicInput, InfographicOutput> = {
  name: 'content.colvin-infographic',
  description: 'Generates the daily Colvin Enterprises branded LinkedIn infographic PNG (fresh topic). (gabriel:daily step 5)',
  kind: 'llm',
  taskType: 'content_generation',
  inputSchema: {
    type: 'object', required: ['model', 'cta', 'dateStr', 'outDir'],
    properties: { model: { type: 'string' }, cta: { type: 'string' }, dateStr: { type: 'string' }, outDir: { type: 'string' } },
  },
  outputSchema: {
    type: 'object', required: ['pngPath', 'htmlPath', 'title'],
    properties: { pngPath: { type: 'string' }, htmlPath: { type: 'string' }, title: { type: 'string' } },
  },
  async run(input, ctx) {
    const { info, pngPath, htmlPath } = await generateColvinInfographic({
      model: input.model, cta: input.cta, dateStr: input.dateStr, outDir: input.outDir,
    })
    const title = `${info.title_line1} ${info.title_line2}`.trim()
    ctx.log(`infographic: ${title}`)
    return { pngPath, htmlPath, title }
  },
}
