// Vercel cron endpoint — runs weekly-blog.ts via dynamic spawn
// Schedule: Wednesdays 14:00 UTC (9 AM CST)
// Authorization: Vercel sends a header — verify or use CRON_SECRET for manual triggers.
import { NextResponse } from 'next/server'
import { spawn } from 'node:child_process'
import * as path from 'node:path'

export const maxDuration = 300

export async function GET(req: Request) {
  // Verify the request is from Vercel cron (or has the CRON_SECRET)
  const authHeader = req.headers.get('authorization') ?? ''
  const isVercelCron = req.headers.get('x-vercel-cron') === '1'
  const hasSecret = authHeader === `Bearer ${process.env.CRON_SECRET}`
  if (!isVercelCron && !hasSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const scriptPath = path.resolve(process.cwd(), 'automation-os/scripts/weekly-blog.ts')

  return new Promise<Response>(resolve => {
    const proc = spawn('npx', ['ts-node', '--compiler-options', '{"module":"commonjs","moduleResolution":"node"}', scriptPath], {
      cwd: process.cwd(),
      env: process.env as NodeJS.ProcessEnv,
    })
    let stdout = ''
    let stderr = ''
    proc.stdout.on('data', (d: Buffer) => { stdout += d.toString() })
    proc.stderr.on('data', (d: Buffer) => { stderr += d.toString() })
    proc.on('close', (code: number) => {
      resolve(NextResponse.json({
        ok: code === 0,
        exit_code: code,
        stdout: stdout.slice(-2000),
        stderr: stderr.slice(-2000),
      }))
    })
    proc.on('error', (err: Error) => {
      resolve(NextResponse.json({ ok: false, error: err.message }, { status: 500 }))
    })
  })
}
