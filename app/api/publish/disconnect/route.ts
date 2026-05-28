import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { platform } = await req.json()
  if (!platform) return NextResponse.json({ error: 'platform required' }, { status: 400 })

  const supabase = createAdminClient()
  await supabase.from('platform_tokens').delete().eq('platform', platform)

  return NextResponse.json({ success: true })
}
