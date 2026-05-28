/**
 * GET /api/auth/facebook
 * Initiates Facebook OAuth flow.
 * Redirects to Facebook authorization dialog.
 */
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function GET() {
  const appId       = process.env.FACEBOOK_APP_ID!
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/facebook/callback`
  const state       = crypto.randomBytes(16).toString('hex')

  const params = new URLSearchParams({
    client_id:     appId,
    redirect_uri:  redirectUri,
    state,
    scope:         'pages_manage_posts,pages_read_engagement,pages_show_list,business_management',
    response_type: 'code',
  })

  const response = NextResponse.redirect(
    `https://www.facebook.com/v19.0/dialog/oauth?${params}`
  )
  response.cookies.set('fb_state', state, {
    httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600,
  })

  return response
}
