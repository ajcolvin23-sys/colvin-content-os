/**
 * GET /api/auth/tiktok
 * Initiates TikTok OAuth 2.0 flow.
 * Redirects to TikTok authorization page.
 */
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function GET() {
  const clientKey    = process.env.TIKTOK_CLIENT_KEY!
  const redirectUri  = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/tiktok/callback`
  const state        = crypto.randomBytes(16).toString('hex')
  const codeVerifier = crypto.randomBytes(32).toString('base64url')
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url')

  const params = new URLSearchParams({
    client_key:            clientKey,
    response_type:         'code',
    scope:                 'user.info.basic,video.publish,video.upload',
    redirect_uri:          redirectUri,
    state,
    code_challenge:        codeChallenge,
    code_challenge_method: 'S256',
  })

  // Store verifier in cookie for callback
  const response = NextResponse.redirect(
    `https://www.tiktok.com/v2/auth/authorize/?${params}`
  )
  response.cookies.set('tiktok_code_verifier', codeVerifier, {
    httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600,
  })
  response.cookies.set('tiktok_state', state, {
    httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600,
  })

  return response
}
