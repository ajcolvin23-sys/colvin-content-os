/**
 * GET /api/auth/tiktok/callback
 * Handles TikTok OAuth callback.
 * Exchanges code for access token, saves to platform_tokens table.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code  = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${APP_URL}/settings/social?error=tiktok_denied`)
  }

  const storedState    = req.cookies.get('tiktok_state')?.value
  const codeVerifier   = req.cookies.get('tiktok_code_verifier')?.value

  if (!code || !state || state !== storedState || !codeVerifier) {
    return NextResponse.redirect(`${APP_URL}/settings/social?error=tiktok_invalid_state`)
  }

  try {
    // Exchange code for token
    const tokenParams = new URLSearchParams({
      client_key:    process.env.TIKTOK_CLIENT_KEY!,
      client_secret: process.env.TIKTOK_CLIENT_SECRET!,
      code,
      grant_type:    'authorization_code',
      redirect_uri:  `${APP_URL}/api/auth/tiktok/callback`,
      code_verifier: codeVerifier,
    })

    const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams,
    })
    const tokenData = await tokenRes.json()

    if (tokenData.error || !tokenData.access_token) {
      console.error('[TikTok OAuth] token exchange failed:', tokenData)
      return NextResponse.redirect(`${APP_URL}/settings/social?error=tiktok_token_failed`)
    }

    // Get user info for display name
    const userRes = await fetch(
      'https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url',
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
    )
    const userData = await userRes.json()
    const displayName = userData.data?.user?.display_name ?? 'TikTok Account'
    const openId      = userData.data?.user?.open_id ?? tokenData.open_id

    // Save to Supabase
    const supabase = createAdminClient()
    await supabase.from('platform_tokens').upsert({
      platform:      'tiktok',
      access_token:  tokenData.access_token,
      refresh_token: tokenData.refresh_token ?? null,
      expires_at:    tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
        : null,
      account_id:   openId,
      account_name: displayName,
      updated_at:   new Date().toISOString(),
    }, { onConflict: 'platform' })

    const response = NextResponse.redirect(`${APP_URL}/settings/social?connected=tiktok`)
    response.cookies.delete('tiktok_state')
    response.cookies.delete('tiktok_code_verifier')
    return response
  } catch (err) {
    console.error('[TikTok OAuth] callback error:', err)
    return NextResponse.redirect(`${APP_URL}/settings/social?error=tiktok_error`)
  }
}
