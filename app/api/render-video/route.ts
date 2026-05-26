/**
 * /api/render-video
 *
 * Triggers a local Remotion render for a video_script.
 * Only works when the Next.js server is running locally.
 *
 * POST { video_id: string, format?: "9:16" | "1:1" | "16:9" }
 * Returns { output_path, file_size_mb, render_time_s } on success
 */

import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'

const VIDEOS_DIR = path.resolve(process.cwd(), 'videos')
const OUT_DIR = path.resolve(process.cwd(), 'out')

const FORMAT_TO_COMPOSITION: Record<string, string> = {
  '9:16': 'VideoEngine-Vertical',
  '1:1':  'VideoEngine-Square',
  '16:9': 'VideoEngine-Wide',
}

export async function POST(req: NextRequest) {
  const { video_id, format = '9:16' } = await req.json()

  if (!video_id) {
    return NextResponse.json({ error: 'video_id is required' }, { status: 400 })
  }

  const jsonPath = path.join(VIDEOS_DIR, `${video_id}.json`)
  if (!fs.existsSync(jsonPath)) {
    return NextResponse.json({ error: `VideoScript not found: videos/${video_id}.json` }, { status: 404 })
  }

  const videoScript = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))

  // Compliance gate
  if (videoScript.claims_check?.risk_level === 'high') {
    return NextResponse.json({
      error: 'Render blocked — claims_check is HIGH risk. Fix compliance issues first.',
      issues: videoScript.claims_check.issues,
    }, { status: 422 })
  }

  const compositionId = FORMAT_TO_COMPOSITION[format] ?? 'VideoEngine-Vertical'
  const outputFilename = `${video_id}-${format.replace(':', 'x')}.mp4`
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })
  const outputPath = path.join(OUT_DIR, outputFilename)

  // Write props file
  const propsPath = path.join(OUT_DIR, `${video_id}-props.json`)
  fs.writeFileSync(propsPath, JSON.stringify({ videoScript }))

  const renderCmd = [
    'npx remotion render',
    'remotion/index.ts',
    compositionId,
    `"${outputPath}"`,
    `--props="${propsPath}"`,
  ].join(' ')

  const startMs = Date.now()
  try {
    execSync(renderCmd, { cwd: process.cwd(), stdio: 'pipe', timeout: 300_000 })
  } catch (err) {
    if (fs.existsSync(propsPath)) fs.unlinkSync(propsPath)
    return NextResponse.json({ error: `Render failed: ${String(err).slice(0, 200)}` }, { status: 500 })
  }

  if (fs.existsSync(propsPath)) fs.unlinkSync(propsPath)

  const renderTimeSec = Math.round((Date.now() - startMs) / 1000)
  const fileSizeMb = fs.existsSync(outputPath)
    ? parseFloat((fs.statSync(outputPath).size / 1024 / 1024).toFixed(1))
    : 0

  return NextResponse.json({
    success: true,
    video_id,
    output_path: outputPath,
    output_filename: outputFilename,
    file_size_mb: fileSizeMb,
    render_time_s: renderTimeSec,
    download_url: `/api/render-video/download?file=${outputFilename}`,
  })
}

// GET /api/render-video/download?file=xxx.mp4 — serve the rendered MP4
export async function GET(req: NextRequest) {
  const file = req.nextUrl.searchParams.get('file')
  if (!file || file.includes('..')) {
    return NextResponse.json({ error: 'Invalid file' }, { status: 400 })
  }

  const filePath = path.join(OUT_DIR, file)
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }

  const buffer = fs.readFileSync(filePath)
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'video/mp4',
      'Content-Disposition': `attachment; filename="${file}"`,
      'Content-Length': String(buffer.length),
    },
  })
}
