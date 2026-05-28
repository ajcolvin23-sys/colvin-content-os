'use client'

/**
 * PublishVideoButton
 *
 * One-click publish for a rendered video to TikTok and/or Facebook Reels.
 * Shows platform status (connected/not), confirmation step, result.
 *
 * Props:
 *   videoPath  — absolute server path to the .mp4 file
 *   caption    — post caption (will be trimmed to platform limits)
 *   title      — short video title
 *   videoName  — display name for the video
 */
import { useState } from 'react'

interface Props {
  videoPath: string
  caption: string
  title: string
  videoName?: string
}

type Platform = 'tiktok' | 'facebook'

interface PlatformResult {
  platform: Platform
  success: boolean
  post_id?: string
  error?: string
}

const PLATFORM_CONFIG = {
  tiktok:   { label: 'TikTok',           color: '#ff2d55', icon: '🎵' },
  facebook: { label: 'Facebook Reels',   color: '#1877f2', icon: '📘' },
}

export function PublishVideoButton({ videoPath, caption, title, videoName }: Props) {
  const [selected, setSelected]   = useState<Platform[]>([])
  const [step, setStep]           = useState<'select' | 'confirm' | 'publishing' | 'done'>('select')
  const [results, setResults]     = useState<PlatformResult[]>([])

  function togglePlatform(p: Platform) {
    setSelected(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
  }

  async function handlePublish() {
    if (!selected.length) return
    setStep('publishing')

    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_path: videoPath, caption, title, platforms: selected }),
      })
      const data = await res.json()
      setResults(data.results ?? [])
      setStep('done')
    } catch (err) {
      setResults(selected.map(p => ({ platform: p, success: false, error: String(err) })))
      setStep('done')
    }
  }

  function reset() {
    setSelected([])
    setStep('select')
    setResults([])
  }

  // ── Done state ────────────────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {results.map(r => (
          <div key={r.platform} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px', borderRadius: 10,
            background: r.success ? '#052e16' : '#2d1515',
            border: `1px solid ${r.success ? '#166534' : '#7f1d1d'}`,
            fontSize: 14, fontWeight: 600,
            color: r.success ? '#86efac' : '#fca5a5',
          }}>
            <span>{PLATFORM_CONFIG[r.platform].icon}</span>
            <span>
              {r.success
                ? `✓ Posted to ${PLATFORM_CONFIG[r.platform].label}`
                : `✗ ${PLATFORM_CONFIG[r.platform].label}: ${r.error}`}
            </span>
          </div>
        ))}
        <button onClick={reset} style={{
          marginTop: 4, padding: '8px 16px', borderRadius: 8,
          background: 'transparent', border: '1px solid #333',
          color: '#666', fontSize: 13, cursor: 'pointer', fontWeight: 600,
        }}>
          Post again
        </button>
      </div>
    )
  }

  // ── Publishing state ──────────────────────────────────────────────────────
  if (step === 'publishing') {
    return (
      <div style={{
        padding: '16px 20px', borderRadius: 12,
        background: '#111', border: '1px solid #222',
        display: 'flex', alignItems: 'center', gap: 12,
        color: '#aaa', fontSize: 14, fontWeight: 600,
      }}>
        <span style={{ fontSize: 20, animation: 'spin 1s linear infinite' }}>⟳</span>
        Uploading to {selected.map(p => PLATFORM_CONFIG[p].label).join(' + ')}... this may take a minute.
      </div>
    )
  }

  // ── Confirm state ─────────────────────────────────────────────────────────
  if (step === 'confirm') {
    return (
      <div style={{
        padding: '20px', borderRadius: 12,
        background: '#111', border: '1px solid #222',
      }}>
        <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: 15, color: '#fff' }}>
          Post &ldquo;{videoName ?? title}&rdquo; to:
        </p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {selected.map(p => (
            <span key={p} style={{
              padding: '4px 12px', borderRadius: 100, fontSize: 13, fontWeight: 700,
              background: `${PLATFORM_CONFIG[p].color}22`,
              border: `1px solid ${PLATFORM_CONFIG[p].color}66`,
              color: PLATFORM_CONFIG[p].color,
            }}>
              {PLATFORM_CONFIG[p].icon} {PLATFORM_CONFIG[p].label}
            </span>
          ))}
        </div>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: '#555', lineHeight: 1.5 }}>
          This will publish immediately. Make sure the video is approved before posting.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handlePublish} style={{
            padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 800,
            background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer',
          }}>
            Publish Now
          </button>
          <button onClick={() => setStep('select')} style={{
            padding: '10px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600,
            background: 'transparent', border: '1px solid #333', color: '#666', cursor: 'pointer',
          }}>
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // ── Select state ──────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <p style={{ margin: '0 0 6px', fontSize: 13, color: '#666', fontWeight: 600 }}>
        Post to:
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
        {(Object.keys(PLATFORM_CONFIG) as Platform[]).map(p => {
          const cfg = PLATFORM_CONFIG[p]
          const isSelected = selected.includes(p)
          return (
            <button
              key={p}
              onClick={() => togglePlatform(p)}
              style={{
                padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                background: isSelected ? `${cfg.color}22` : 'transparent',
                border: `1px solid ${isSelected ? cfg.color : '#333'}`,
                color: isSelected ? cfg.color : '#666',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {cfg.icon} {cfg.label}
            </button>
          )
        })}
      </div>
      {selected.length > 0 && (
        <button
          onClick={() => setStep('confirm')}
          style={{
            marginTop: 4, padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 800,
            background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer',
            alignSelf: 'flex-start',
          }}
        >
          Publish →
        </button>
      )}
    </div>
  )
}
