/**
 * TikTok Content Posting API v2
 *
 * Flow:
 *   1. initVideoUpload() — get upload_url + publish_id from TikTok
 *   2. uploadVideoFile() — PUT video bytes in one chunk (< 64MB)
 *   3. pollPublishStatus() — poll until PUBLISH_COMPLETE
 *
 * Requires: TIKTOK_ACCESS_TOKEN stored in platform_tokens table
 * Scope needed on token: video.publish, video.upload
 */
import * as fs from 'fs'
import * as https from 'https'

export interface TikTokPostResult {
  success: boolean
  publish_id?: string
  error?: string
}

interface InitResponse {
  data?: {
    publish_id: string
    upload_url: string
  }
  error?: {
    code: string
    message: string
    log_id: string
  }
}

interface StatusResponse {
  data?: {
    status: 'PROCESSING_UPLOAD' | 'PUBLISH_COMPLETE' | 'FAILED' | 'CANCELED'
    fail_reason?: string
    publicaly_available_post_id?: string[]
  }
  error?: { code: string; message: string }
}

// ── Init upload ───────────────────────────────────────────────────────────────
async function initVideoUpload(
  accessToken: string,
  title: string,
  videoSizeBytes: number
): Promise<{ publish_id: string; upload_url: string } | null> {
  const chunkSize = videoSizeBytes // single chunk (< 64MB)

  const body = JSON.stringify({
    post_info: {
      title: title.slice(0, 2200), // TikTok title max
      privacy_level: 'PUBLIC_TO_EVERYONE',
      disable_duet: false,
      disable_comment: false,
      disable_stitch: false,
      video_cover_timestamp_ms: 1000,
    },
    source_info: {
      source: 'FILE_UPLOAD',
      video_size: videoSizeBytes,
      chunk_size: chunkSize,
      total_chunk_count: 1,
    },
  })

  return new Promise((resolve) => {
    const options = {
      hostname: 'open.tiktokapis.com',
      path: '/v2/post/publish/video/init/',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'Content-Length': Buffer.byteLength(body),
      },
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => {
        try {
          const json: InitResponse = JSON.parse(data)
          if (json.error?.code && json.error.code !== 'ok') {
            console.error('[TikTok] init error:', json.error)
            resolve(null)
            return
          }
          if (!json.data?.publish_id || !json.data?.upload_url) {
            console.error('[TikTok] init missing data:', data)
            resolve(null)
            return
          }
          resolve({ publish_id: json.data.publish_id, upload_url: json.data.upload_url })
        } catch (e) {
          console.error('[TikTok] init parse error:', e)
          resolve(null)
        }
      })
    })
    req.on('error', (e) => { console.error('[TikTok] init request error:', e); resolve(null) })
    req.write(body)
    req.end()
  })
}

// ── Upload video bytes in one chunk ───────────────────────────────────────────
async function uploadVideoFile(
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
      method: 'PUT',
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': videoSizeBytes,
        'Content-Range': `bytes 0-${videoSizeBytes - 1}/${videoSizeBytes}`,
      },
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => {
        // TikTok returns 2xx on success for chunk upload
        const ok = res.statusCode !== undefined && res.statusCode >= 200 && res.statusCode < 300
        if (!ok) console.error('[TikTok] upload failed:', res.statusCode, data)
        resolve(ok)
      })
    })
    req.on('error', (e) => { console.error('[TikTok] upload error:', e); resolve(false) })
    req.write(videoBuffer)
    req.end()
  })
}

// ── Poll publish status until complete (max 2 min) ───────────────────────────
async function pollPublishStatus(
  accessToken: string,
  publishId: string
): Promise<boolean> {
  const maxAttempts = 24 // 24 × 5s = 2 min
  const body = JSON.stringify({ publish_id: publishId })

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 5000))

    const result = await new Promise<StatusResponse | null>((resolve) => {
      const options = {
        hostname: 'open.tiktokapis.com',
        path: '/v2/post/publish/status/fetch/',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8',
          'Content-Length': Buffer.byteLength(body),
        },
      }
      const req = https.request(options, (res) => {
        let data = ''
        res.on('data', c => data += c)
        res.on('end', () => {
          try { resolve(JSON.parse(data)) } catch { resolve(null) }
        })
      })
      req.on('error', () => resolve(null))
      req.write(body)
      req.end()
    })

    if (!result) continue
    const status = result.data?.status
    console.log(`[TikTok] publish status (attempt ${i + 1}): ${status}`)

    if (status === 'PUBLISH_COMPLETE') return true
    if (status === 'FAILED' || status === 'CANCELED') {
      console.error('[TikTok] publish failed:', result.data?.fail_reason)
      return false
    }
  }

  console.error('[TikTok] publish timed out after 2 minutes')
  return false
}

// ── Main export ───────────────────────────────────────────────────────────────
export async function postVideoToTikTok(
  accessToken: string,
  videoPath: string,
  caption: string
): Promise<TikTokPostResult> {
  try {
    if (!fs.existsSync(videoPath)) {
      return { success: false, error: `Video file not found: ${videoPath}` }
    }

    const stats = fs.statSync(videoPath)
    const videoSizeBytes = stats.size
    console.log(`[TikTok] uploading ${(videoSizeBytes / 1024 / 1024).toFixed(1)}MB video...`)

    // Step 1: Init
    const init = await initVideoUpload(accessToken, caption, videoSizeBytes)
    if (!init) return { success: false, error: 'TikTok init upload failed' }
    console.log(`[TikTok] init success — publish_id: ${init.publish_id}`)

    // Step 2: Upload
    const uploaded = await uploadVideoFile(init.upload_url, videoPath, videoSizeBytes)
    if (!uploaded) return { success: false, error: 'TikTok video upload failed' }
    console.log('[TikTok] upload complete — polling for publish status...')

    // Step 3: Poll
    const published = await pollPublishStatus(accessToken, init.publish_id)
    if (!published) return { success: false, error: 'TikTok publish did not complete', publish_id: init.publish_id }

    console.log(`[TikTok] ✓ published — publish_id: ${init.publish_id}`)
    return { success: true, publish_id: init.publish_id }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}
