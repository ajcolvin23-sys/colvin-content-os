import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAction } from '@/lib/audit'

const CreateSchema = z.object({
  lane: z.enum(['piano', 'backflow', 'linkedin', 'colvin_enterprises']),
  platform: z.enum(['tiktok', 'youtube', 'facebook', 'linkedin', 'instagram', 'multi']),
  content_type: z.string(),
  title: z.string().min(1).max(500),
  hook: z.string().optional(),
  body: z.string().optional(),
  caption: z.string().optional(),
  cta: z.string().optional(),
  hashtags: z.array(z.string()).optional(),
  visual_direction: z.string().optional(),
  status: z.enum(['draft', 'needs_review', 'approved', 'scheduled', 'published', 'failed', 'manual_required', 'archived']).optional(),
  scheduled_at: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const supabase = createAdminClient()
  const { searchParams } = new URL(req.url)

  const status = searchParams.get('status')
  const platform = searchParams.get('platform')
  const lane = searchParams.get('lane')
  const limit = parseInt(searchParams.get('limit') || '50')

  let query = supabase
    .from('content_items')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (status) query = query.eq('status', status)
  if (platform) query = query.eq('platform', platform)
  if (lane) query = query.eq('lane', lane)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = CreateSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('content_items')
      .insert({ ...parsed.data, hashtags: parsed.data.hashtags || [], status: parsed.data.status || 'draft' })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await logAction('create', 'content_item', data.id, data.title, { lane: data.lane, platform: data.platform })
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
