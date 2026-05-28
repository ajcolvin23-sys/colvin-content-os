// ─── Hub Scope API ────────────────────────────────────────────────────────────
// POST sets the active hub scope cookie. The client component calls this when
// the user picks a different niche in the sidebar.
// ─────────────────────────────────────────────────────────────────────────────
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { HUB_SCOPE_COOKIE, ALL_HUBS } from '@/lib/crm/hub-scope'

export async function POST(request: Request) {
  try {
    const body = await request.json() as { scope?: string }
    const scope = body.scope?.trim()

    if (!scope) {
      return NextResponse.json({ error: 'Missing scope' }, { status: 400 })
    }

    const cookieStore = await cookies()

    if (scope === ALL_HUBS) {
      cookieStore.delete(HUB_SCOPE_COOKIE)
    } else {
      cookieStore.set(HUB_SCOPE_COOKIE, scope, {
        httpOnly: false, // readable by client component for current-value display
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1 year
      })
    }

    return NextResponse.json({ ok: true, scope })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to set scope' },
      { status: 500 }
    )
  }
}
