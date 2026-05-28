/**
 * GET /api/auth/facebook/callback
 * Handles Facebook OAuth callback.
 * Exchanges code for user token → gets long-lived token → gets page token.
 * Saves page token to platform_tokens table.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const APP_URL    = process.env.NEXT_PUBLIC_APP_URL!
const APP_ID     = process.env.FACEBOOK_APP_ID!
const APP_SECRET = process.env.FACEBOOK_APP_SECRET!
const PAGE_ID    = process.env.FACEBOOK_PAGE_ID!
const GRAPH      = 'https://graph.facebook.com/v19.0'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code  = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${APP_URL}/settings/social?error=facebook_denied`)
  }

  const storedState = req.cookies.get('fb_state')?.value
  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(`${APP_URL}/settings/social?error=facebook_invalid_state`)
  }

  try {
    const redirectUri = `${APP_URL}/api/auth/facebook/callback`

    // Step 1: Short-lived user token
    const shortRes = await fetch(
      `${GRAPH}/oauth/access_token?client_id=${APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${APP_SECRET}&code=${code}`
    )
    const shortData = await shortRes.json()
    if (shortData.error || !shortData.access_token) {
      console.error('[Facebook OAuth] short token error:', shortData)
      return NextResponse.redirect(`${APP_URL}/settings/social?error=facebook_token_failed`)
    }

    // Step 2: Exchange for long-lived user token (60 days)
    const longRes = await fetch(
      `${GRAPH}/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${APP_SECRET}&fb_exchange_token=${shortData.access_token}`
    )
    const longData = await longRes.json()
    if (longData.error || !longData.access_token) {
      console.error('[Facebook OAuth] long token error:', longData)
      return NextResponse.redirect(`${APP_URL}/settings/social?error=facebook_token_failed`)
    }

    // Step 3: Get Page access token (never expires)
    const pagesRes = await fetch(
      `${GRAPH}/me/accounts?access_token=${longData.access_token}`
    )
    const pagesData = await pagesRes.json()
    const page = pagesData.data?.find((p: { id: string }) => p.id === PAGE_ID)

    if (!page) {
      console.error('[Facebook OAuth] page not found in accounts. Available:', pagesData.data?.map((p: { id: string; name: string }) => p.id))
      return NextResponse.redirect(`${APP_URL}/settings/social?error=facebook_page_not_found`)
    }

    const pageToken = page.access_token
    const pageName  = page.name ?? 'Facebook Page'

    // Save to Supabase
    const supabase = createAdminClient()
    await supabase.from('platform_tokens').upsert({
      platform:      'facebook',
      access_token:  pageToken,
      refresh_token: null, // page tokens don't expire if from long-lived user token
      expires_at:    null,
      account_id:    PAGE_ID,
      account_name:  pageName,
      updated_at:    new Date().toISOString(),
    }, { onConflict: 'platform' })

    const response = NextResponse.redirect(`${APP_URL}/settings/social?connected=facebook`)
    response.cookies.delete('fb_state')
    return response
  } catch (err) {
    console.error('[Facebook OAuth] callback error:', err)
    return NextResponse.redirect(`${APP_URL}/settings/social?error=facebook_error`)
  }
}
