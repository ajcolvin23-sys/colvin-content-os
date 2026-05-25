import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateVideoScript } from '@/lib/ai/generate'
import { logAction } from '@/lib/audit'

const VideoProjectSchema = z.object({
  title: z.string().min(1).max(300),
  platform: z.enum(['tiktok', 'youtube']).default('tiktok'),
  topic: z.string().min(3),
  lesson_objective: z.string().optional(),
  cta: z.string().optional(),
  book_page_description: z.string().optional(),
  slide_count: z.number().min(3).max(12).optional(),
})

export async function GET() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('video_projects')
    .select('*, video_slides(*)')
    .order('created_at', { ascending: false })
    .limit(30)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = VideoProjectSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const supabase = createAdminClient()

    // Generate script with AI
    const script = await generateVideoScript({
      topic: parsed.data.topic,
      platform: parsed.data.platform,
      lesson_objective: parsed.data.lesson_objective || parsed.data.topic,
      cta: parsed.data.cta || 'Follow for more piano tips',
      book_page_description: parsed.data.book_page_description,
      slide_count: parsed.data.slide_count,
    })

    // Create video project
    const { data: project, error: projErr } = await supabase
      .from('video_projects')
      .insert({
        title: parsed.data.title,
        lane: 'piano',
        platform: parsed.data.platform,
        aspect_ratio: '9:16',
        render_status: 'script_ready',
        voiceover_script: script.full_voiceover,
        render_settings: {
          hook: script.hook,
          thumbnail_text: script.thumbnail_text,
          caption: script.caption,
          hashtags: script.hashtags,
          cta: script.cta,
        },
      })
      .select()
      .single()

    if (projErr) return NextResponse.json({ error: projErr.message }, { status: 500 })

    // Insert slides
    if (script.slides.length > 0) {
      const slides = script.slides.map((s) => ({
        video_project_id: project.id,
        slide_order: s.order,
        text_on_screen: s.text_on_screen,
        voiceover_text: s.voiceover_text,
        duration_seconds: s.duration_seconds || 4,
        transition: s.transition || 'fade',
        slide_type: 'text',
      }))
      await supabase.from('video_slides').insert(slides)
    }

    await logAction('create', 'video_project', project.id, project.title, {
      platform: parsed.data.platform,
      slides: script.slides.length,
    })

    return NextResponse.json({ project, script }, { status: 201 })
  } catch (err) {
    console.error('[video]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
