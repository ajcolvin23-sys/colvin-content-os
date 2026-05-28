/**
 * Facebook Reels Publishing — Meta Graph API v19
 *
 * Flow:
 *   1. startReelsUpload() — initialize with Graph API → get video_id + upload_url
 *   2. uploadReelsVideo() — POST video bytes to upload_url
 *   3. publishReel() — finish upload phase with caption + published=true
 *
 * Requires: FACEBOOK_PAGE_ACCESS_TOKEN stored in platform_tokens table
 * Scope needed: pages_manage_posts, pages_read_engagement
 */
import * as fs from 'fs'
import * as https from 'https'

export interface FacebookReelsResult {
  success: boolean
  post_id?: string
  error?: string
}

const GRAPH_VERSION = 'v19.0'

// ── Step 1: Start upload session ──────────────────────────────────────────────
async function startReelsUpload(
  pageId: string,
  pageToken: string,
  videoSizeBytes: number
): Promise<{ video_id: string; upload_url: string } | null> {
  const params = new URLSearchParams({
    upload_phase: 'start',
    file_size: String(videoSizeBytes),
    access_token: pageToken,
  })

  return new Promise((resolve) => {
    const options = {
      hostname: 'graph.facebook.com',
      path: `/${GRAPH_VERSION}/${pageId}/video_reels?${params}`,
      method: 'POST',
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          if (json.error) { console.error('[Facebook] start error:', json.error); resolve(null); return }
          if (!json.video_id || !json.upload_url) { console.error('[Facebook] start missing fields:', data); resolve(null); return }
          resolve({ video_id: json.video_id, upload_url: json.upload_url })
        } catch (e) { console.error('[Facebook] start parse error:', e, data); resolve(null) }
      })
    })
    req.on('error', (e) => { console.error('[Facebook] start error:', e); resolve(null) })
    req.end()
  })
}

// ── Step 2: Upload video bytes ────────────────────────────────────────────────
async function uploadReelsVideo(
  uploadUrl: string,
  videoPath: string,
  videoSizeBytes: number
): Promise<boolean> {
  const videoBuffer = fs.readFileSync(videoPath)

  return new Promise((resolve) => {
    const url = new URL(uploadUrl)

    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        Authorization: 'OAuth ' + (uploadUrl.match(/access_token=([^&]+)/)?.[1] ?? ''),
        'Content-Type': 'application/octet-stream',
        'Content-Length': videoSizeBytes,
        offset: '0',
        file_size: String(videoSizeBytes),
      },
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          // Facebook returns { success: true } on upload success
          if (json.success === true) { resolve(true); return }
          console.error('[Facebook] upload response:', data)
          resolve(false)
        } catch {
          // Some FB responses are not JSON — check status code
          const ok = res.statusCode !== undefined && res.statusCode >= 200 && res.statusCode < 300
          if (!ok) console.error('[Facebook] upload status:', res.statusCode, data)
          resolve(ok)
        }
      })
    })
    req.on('error', (e) => { console.error('[Facebook] upload error:', e); resolve(false) })
    req.write(videoBuffer)
    req.end()
  })
}

// ── Step 3: Finish + publish ──────────────────────────────────────────────────
async function publishReel(
  pageId: string,
  pageToken: string,
  videoId: string,
  description: string,
  title: string
): Promise<string | null> {
  const params = new URLSearchParams({
    upload_phase: 'finish',
    video_id: videoId,
    description: description.slice(0, 2200),
    title: title.slice(0, 255),
    video_state: 'REELS_READY',
    published: 'true',
    access_token: pageToken,
  })

  return new Promise((resolve) => {
    const options = {
      hostname: 'graph.facebook.com',
      path: `/${GRAPH_VERSION}/${pageId}/video_reels`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(params.toString()),
      },
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          if (json.error) { console.error('[Facebook] publish error:', json.error); resolve(null); return }
          // Returns { success: true, post_id: "..." }
          resolve(json.post_id ?? json.id ?? videoId)
        } catch (e) { console.error('[Facebook] publish parse error:', e, data); resolve(null) }
      })
    })
    req.on('error', (e) => { console.error('[Facebook] publish req error:', e); resolve(null) })
    req.write(params.toString())
    req.end()
  })
}

// ── Main export ───────────────────────────────────────────────────────────────
export async function postVideoToFacebookReels(
  pageToken: string,
  pageId: string,
  videoPath: string,
  description: string,
  title: string
): Promise<FacebookReelsResult> {
  try {
    if (!fs.existsSync(videoPath)) {
      return { success: false, error: `Video file not found: ${videoPath}` }
    }

    const stats = fs.statSync(videoPath)
    const videoSizeBytes = stats.size
    console.log(`[Facebook] uploading ${(videoSizeBytes / 1024 / 1024).toFixed(1)}MB reel...`)

    // Step 1: Start
    const session = await startReelsUpload(pageId, pageToken, videoSizeBytes)
    if (!session) return { success: false, error: 'Facebook upload session init failed' }
    console.log(`[Facebook] session started — video_id: ${session.video_id}`)

    // Step 2: Upload
    const uploaded = await uploadReelsVideo(session.upload_url, videoPath, videoSizeBytes)
    if (!uploaded) return { success: false, error: 'Facebook video upload failed' }
    console.log('[Facebook] upload complete — publishing...')

    // Step 3: Publish
    const postId = await publishReel(pageId, pageToken, session.video_id, description, title)
    if (!postId) return { success: false, error: 'Facebook publish failed' }

    console.log(`[Facebook] ✓ published — post_id: ${postId}`)
    return { success: true, post_id: postId }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}
