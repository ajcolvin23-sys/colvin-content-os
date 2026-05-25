// Platform integration stubs
// Each function returns a result indicating whether the post was published or needs manual posting

export type PublishResult =
  | { success: true; platform_post_id: string }
  | { success: false; manual_required: boolean; reason: string }

// ── TikTok ───────────────────────────────────────────────────────────────────
export async function publishToTikTok(
  _videoUrl: string,
  _caption: string,
  _accountId: string
): Promise<PublishResult> {
  // TikTok Content Posting API requires app review and Creator Account access
  // Stub: always returns manual_required until credentials are configured
  if (!process.env.TIKTOK_CLIENT_KEY) {
    return {
      success: false,
      manual_required: true,
      reason: 'TikTok API credentials not configured. Post manually.',
    }
  }
  // TODO: implement TikTok Content Posting API
  return { success: false, manual_required: true, reason: 'TikTok posting not yet implemented.' }
}

// ── YouTube ──────────────────────────────────────────────────────────────────
export async function publishToYouTube(
  _videoUrl: string,
  _title: string,
  _description: string,
  _tags: string[],
  _privacyStatus: 'private' | 'unlisted' | 'public' = 'private'
): Promise<PublishResult> {
  if (!process.env.YOUTUBE_CLIENT_ID) {
    return {
      success: false,
      manual_required: true,
      reason: 'YouTube API credentials not configured. Upload manually.',
    }
  }
  // TODO: implement YouTube Data API v3 videos.insert
  return { success: false, manual_required: true, reason: 'YouTube posting not yet implemented.' }
}

// ── Facebook ─────────────────────────────────────────────────────────────────
export async function publishToFacebook(
  _message: string,
  _pageId: string,
  _imageUrl?: string
): Promise<PublishResult> {
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN
  const pageId = process.env.FACEBOOK_PAGE_ID || _pageId

  if (!token || !pageId) {
    return {
      success: false,
      manual_required: true,
      reason: 'Facebook page token not configured. Post manually.',
    }
  }

  try {
    const endpoint = _imageUrl
      ? `https://graph.facebook.com/v19.0/${pageId}/photos`
      : `https://graph.facebook.com/v19.0/${pageId}/feed`

    const body: Record<string, string> = _imageUrl
      ? { caption: _message, url: _imageUrl, access_token: token }
      : { message: _message, access_token: token }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    if (data.id) return { success: true, platform_post_id: data.id }
    return { success: false, manual_required: true, reason: data.error?.message || 'Facebook API error' }
  } catch (err) {
    return { success: false, manual_required: true, reason: String(err) }
  }
}

// ── LinkedIn ─────────────────────────────────────────────────────────────────
export async function publishToLinkedIn(
  _text: string,
  _authorUrn: string
): Promise<PublishResult> {
  if (!process.env.LINKEDIN_ACCESS_TOKEN) {
    return {
      success: false,
      manual_required: true,
      reason: 'LinkedIn API credentials not configured. Post manually.',
    }
  }
  // TODO: implement LinkedIn Posts API (UGC posts endpoint)
  return { success: false, manual_required: true, reason: 'LinkedIn posting not yet implemented.' }
}
