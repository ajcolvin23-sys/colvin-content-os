// ─── Public asset upload (Supabase Storage) ─────────────────────────────────
// Durable home for generated media (infographics, etc.) so it survives the
// ephemeral CI run and is retrievable/displayable from the approvals page.
// Uploads to a public bucket and returns the public URL.

import * as fs from 'fs'
import * as path from 'path'
import type { SupabaseClient } from '@supabase/supabase-js'

const BUCKET = 'content-media'
const CONTENT_TYPES: Record<string, string> = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.mp4': 'video/mp4', '.webp': 'image/webp' }

let bucketEnsured = false

/**
 * Upload a local file to the public content-media bucket and return its public URL.
 * Returns null on failure (never throws — generation must not break on upload).
 */
export async function uploadPublicAsset(
  supabase: SupabaseClient,
  localPath: string,
  folder = 'misc',
): Promise<string | null> {
  try {
    if (!fs.existsSync(localPath)) return null
    if (!bucketEnsured) {
      // Idempotent: errors (e.g. "already exists") are fine.
      await supabase.storage.createBucket(BUCKET, { public: true }).catch(() => undefined)
      bucketEnsured = true
    }
    const ext = path.extname(localPath).toLowerCase()
    const key = `${folder}/${path.basename(localPath)}`
    const body = fs.readFileSync(localPath)
    const { error } = await supabase.storage.from(BUCKET).upload(key, body, {
      contentType: CONTENT_TYPES[ext] ?? 'application/octet-stream',
      upsert: true,
    })
    if (error) return null
    return supabase.storage.from(BUCKET).getPublicUrl(key).data.publicUrl
  } catch {
    return null
  }
}
