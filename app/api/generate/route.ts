import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generateContent, generateVideoScript, generateOutreachDraft, generateConversionOptimized } from '@/lib/ai/generate'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAction } from '@/lib/audit'

const ContentSchema = z.object({
  type: z.enum(['content', 'video_script', 'outreach', 'conversion_optimized']),
  lane: z.enum(['piano', 'backflow', 'linkedin', 'colvin_enterprises']).optional(),
  platform: z.enum(['tiktok', 'youtube', 'facebook', 'linkedin', 'instagram', 'multi']).optional(),
  content_type: z.string().optional(),
  topic: z.string().min(3).max(500),
  lesson_objective: z.string().optional(),
  cta: z.string().optional(),
  target_audience: z.string().optional(),
  additional_context: z.string().optional(),
  tone: z.enum(['professional', 'casual', 'educational', 'inspirational']).optional(),
  book_page_description: z.string().optional(),
  slide_count: z.number().min(3).max(12).optional(),
  // Outreach fields
  prospect_name: z.string().optional(),
  prospect_company: z.string().optional(),
  prospect_title: z.string().optional(),
  verified_signal: z.string().optional(),
  pain_hypothesis: z.string().optional(),
  offer_fit: z.string().optional(),
  save_to_db: z.boolean().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = ContentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any

    if (data.type === 'conversion_optimized') {
      result = await generateConversionOptimized({
        lane: data.lane || 'colvin_enterprises',
        platform: data.platform || 'linkedin',
        content_type: (data.content_type as never) || 'post',
        topic: data.topic,
        target_audience: data.target_audience,
        cta: data.cta,
        additional_context: data.additional_context,
        tone: data.tone,
      })
    } else if (data.type === 'video_script') {
      result = await generateVideoScript({
        topic: data.topic,
        platform: (data.platform as 'tiktok' | 'youtube') || 'tiktok',
        lesson_objective: data.lesson_objective || data.topic,
        cta: data.cta || 'Follow for more piano tips',
        book_page_description: data.book_page_description,
        slide_count: data.slide_count,
      })
    } else if (data.type === 'outreach') {
      result = await generateOutreachDraft({
        name: data.prospect_name || 'Business Owner',
        company: data.prospect_company,
        title: data.prospect_title,
        verified_signal: data.verified_signal,
        pain_hypothesis: data.pain_hypothesis,
        offer_fit: data.offer_fit,
      })
    } else {
      result = await generateContent({
        lane: data.lane || 'colvin_enterprises',
        platform: data.platform || 'linkedin',
        content_type: (data.content_type as never) || 'post',
        topic: data.topic,
        target_audience: data.target_audience,
        cta: data.cta,
        additional_context: data.additional_context,
        tone: data.tone,
      })
    }

    // Optionally save draft to content_items
    if (data.save_to_db && data.type === 'content' && data.lane && data.platform) {
      const supabase = createAdminClient()
      const { data: inserted } = await supabase
        .from('content_items')
        .insert({
          lane: data.lane,
          platform: data.platform,
          content_type: data.content_type || 'post',
          title: data.topic,
          hook: (result as { hook?: string }).hook,
          body: (result as { body?: string }).body,
          caption: (result as { caption?: string }).caption,
          cta: (result as { cta?: string }).cta,
          hashtags: (result as { hashtags?: string[] }).hashtags || [],
          visual_direction: (result as { visual_direction?: string }).visual_direction,
          status: 'draft',
          generation_model: 'gpt-4o-mini',
        })
        .select()
        .single()

      if (inserted) {
        await logAction('generate', 'content_item', inserted.id, data.topic, { lane: data.lane, platform: data.platform })
        return NextResponse.json({ ...result, content_item_id: inserted.id })
      }
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('[generate]', err)
    return NextResponse.json({ error: 'Generation failed', message: String(err) }, { status: 500 })
  }
}
