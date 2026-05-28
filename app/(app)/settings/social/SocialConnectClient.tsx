'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'

interface ConnectedAccount {
  account_name: string
  updated_at: string
}

interface Props {
  connected: Record<string, ConnectedAccount>
}

const PLATFORMS = [
  {
    id: 'tiktok',
    name: 'TikTok',
    description: 'Post Reels to your TikTok profile',
    connectUrl: '/api/auth/tiktok',
    color: '#ff2d55',
    icon: '🎵',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    description: 'Post Reels to your Facebook Page',
    connectUrl: '/api/auth/facebook',
    color: '#1877f2',
    icon: '📘',
  },
]

function StatusBanner() {
  const params = useSearchParams()
  const connected = params.get('connected')
  const error = params.get('error')

  if (!connected && !error) return null

  const bg = connected ? '#052e16' : '#2d1515'
  const border = connected ? '#166534' : '#7f1d1d'
  const message = connected
    ? `✓ ${connected.charAt(0).toUpperCase() + connected.slice(1)} connected successfully`
    : `✗ ${error?.replace(/_/g, ' ')}`

  return (
    <div style={{
      background: bg, border: `1px solid ${border}`, borderRadius: 12,
      padding: '14px 20px', marginBottom: 32, fontSize: 15, fontWeight: 600,
      color: connected ? '#86efac' : '#fca5a5',
    }}>
      {message}
    </div>
  )
}

export default function SocialConnectClient({ connected }: Props) {
  const [disconnecting, setDisconnecting] = useState<string | null>(null)

  async function handleDisconnect(platform: string) {
    setDisconnecting(platform)
    await fetch(`/api/publish/disconnect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform }),
    })
    window.location.reload()
  }

  return (
    <>
      <Suspense fallback={null}>
        <StatusBanner />
      </Suspense>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {PLATFORMS.map((p) => {
          const account = connected[p.id]
          const isConnected = !!account

          return (
            <div key={p.id} style={{
              background: '#111', border: '1px solid #222', borderRadius: 16,
              padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 20,
            }}>
              {/* Icon */}
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: '#1a1a1a', border: `1px solid ${p.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26, flexShrink: 0,
              }}>
                {p.icon}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{p.name}</div>
                {isConnected ? (
                  <>
                    <div style={{ fontSize: 14, color: '#86efac', fontWeight: 600, marginBottom: 2 }}>
                      ✓ Connected — {account.account_name}
                    </div>
                    <div style={{ fontSize: 12, color: '#555' }}>
                      Last updated {new Date(account.updated_at).toLocaleDateString()}
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: 14, color: '#666' }}>{p.description}</div>
                )}
              </div>

              {/* Action */}
              {isConnected ? (
                <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                  <a href={p.connectUrl} style={{
                    padding: '10px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                    background: 'transparent', border: '1px solid #333', color: '#aaa',
                    textDecoration: 'none', cursor: 'pointer',
                  }}>
                    Reconnect
                  </a>
                  <button
                    onClick={() => handleDisconnect(p.id)}
                    disabled={disconnecting === p.id}
                    style={{
                      padding: '10px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                      background: 'transparent', border: '1px solid #7f1d1d', color: '#fca5a5',
                      cursor: 'pointer',
                    }}
                  >
                    {disconnecting === p.id ? 'Removing...' : 'Disconnect'}
                  </button>
                </div>
              ) : (
                <a href={p.connectUrl} style={{
                  padding: '12px 24px', borderRadius: 10, fontSize: 15, fontWeight: 700,
                  background: p.color, color: '#fff', textDecoration: 'none',
                  flexShrink: 0, cursor: 'pointer',
                }}>
                  Connect
                </a>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 40, padding: '20px 24px', background: '#111', border: '1px solid #1f2937', borderRadius: 12 }}>
        <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6, margin: 0 }}>
          <strong style={{ color: '#666' }}>Note:</strong> TikTok tokens expire every 24 hours and need to be refreshed.
          Facebook Page tokens are long-lived. Videos are never auto-published — Alfred approves each post before it goes out.
        </p>
      </div>
    </>
  )
}
