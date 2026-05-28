/**
 * POST /api/publish
 *
 * Publishes a rendered video to one or more platforms.
 *
 * Body:
 *   {
 *     video_path: string       // absolute path to .mp4 on server
 *     caption: string          // post caption/description
 *     title: string            // short title
 *     platforms: ('tiktok' | 'facebook')[]
 *   }
 *
 * Returns:
 *   { results: { platform, success, post_id?, error? }[] }
 */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { postVideoToTikTok } from '@/lib/platforms/tiktok'
import { postVideoToFacebookReels } from '@/lib/platforms/facebook-reels'

export const dynamic = 'force-dynamic'
// Disable body size limit — video files are large
export const maxDuration = 300 // 5 min timeout for upload

interface PublishBody {
  video_path: string
  caption: string
  title: string
  platforms: ('tiktok' | 'facebook')[]
}

interface PlatformResult {
  platform: string
  success: boolean
  post_id?: string
  error?: string
}

export async function POST(req: NextRequest) {
  try {
    const body: PublishBody = await req.json()
    const { video_path, caption, title, platforms } = body

    if (!video_path || !caption || !platforms?.length) {
      return NextResponse.json({ error: 'video_path, caption, and platforms are required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const results: PlatformResult[] = []

    for (const platform of platforms) {
      // Load token from Supabase
      const { data: tokenRow } = await supabase
        .from('platform_tokens')
        .select('access_token, account_id, account_name')
        .eq('platform', platform)
        .single()

      if (!tokenRow?.access_token) {
        results.push({
          platform,
          success: false,
          error: `${platform} not connected — visit /settings/social to connect`,
        })
        continue
      }

      console.log(`[publish] posting to ${platform} (${tokenRow.account_name})...`)

      if (platform === 'tiktok') {
        const result = await postVideoToTikTok(
          tokenRow.access_token,
          video_path,
          caption
        )
        results.push({ platform, ...result })

      } else if (platform === 'facebook') {
        const pageId = tokenRow.account_id ?? process.env.FACEBOOK_PAGE_ID!
        const result = await postVideoToFacebookReels(
          tokenRow.access_token,
          pageId,
          video_path,
          caption,
          title
        )
        results.push({ platform, ...result })
      }
    }

    // Log publish attempts to Supabase
    for (const result of results) {
      await supabase.from('publish_logs').insert({
        platform:   result.platform,
        video_path,
        caption,
        success:    result.success,
        post_id:    result.post_id ?? null,
        error:      result.error ?? null,
        published_at: new Date().toISOString(),
      }).then(({ error: e }) => { if (e) console.warn('[publish] log insert failed:', e.message) })
    }

    const allSuccess = results.every(r => r.success)
    return NextResponse.json({ results }, { status: allSuccess ? 200 : 207 })

  } catch (err) {
    console.error('[publish] error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// ── GET /api/publish — check connection status ─────────────────────────────
export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data: tokens } = await supabase
      .from('platform_tokens')
      .select('platform, account_name, account_id, expires_at, updated_at')

    const connected: Record<string, { account_name: string; account_id: string; updated_at: string }> = {}
    for (const t of tokens ?? []) {
      connected[t.platform] = {
        account_name: t.account_name,
        account_id:   t.account_id,
        updated_at:   t.updated_at,
      }
    }

    return NextResponse.json({ connected })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
