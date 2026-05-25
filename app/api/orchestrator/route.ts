import { NextRequest, NextResponse } from 'next/server'
import { runOrchestrator } from '@/lib/agents/orchestrator'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAction } from '@/lib/audit'

export async function POST(req: NextRequest) {
  try {
    const { message, save_to_db = true } = await req.json()

    if (!message || typeof message !== 'string' || message.trim().length < 3) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 })
    }

    const result = await runOrchestrator(message.trim())

    // Save to Supabase for history
    if (save_to_db) {
      try {
        const supabase = createAdminClient()
        await supabase.from('content_items').insert({
          title: `[Orchestrator] ${result.plan.intent.slice(0, 120)}`,
          body: result.final_output,
          lane: result.plan.lane || 'colvin_enterprises',
          platform: 'multi',
          status: 'draft',
          caption: message,
          render_metadata: {
            agents_used: result.agents_used,
            plan: result.plan,
            execution_time_ms: result.execution_time_ms,
          },
        })
        await logAction('create', 'orchestrator_run', undefined, result.plan.intent, {
          agents: result.agents_used,
          steps: result.plan.steps.length,
        })
      } catch {
        // Don't fail the request if DB save fails
      }
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('[orchestrator]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// GET — fetch recent orchestrator runs from content_items
export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('content_items')
      .select('id, title, body, lane, created_at, render_metadata')
      .like('title', '[Orchestrator]%')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
