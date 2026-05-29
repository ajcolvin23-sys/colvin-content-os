'use client'

import { useState } from 'react'
import { Copy, Check, ExternalLink, Send } from 'lucide-react'

type Tab = 'posts' | 'outreach'

interface Props {
  initialPosts: Record<string, unknown>[]
  initialOutreach: Record<string, unknown>[]
}

const LANE_LABELS: Record<string, string> = {
  colvin_enterprises: 'Colvin Enterprises',
  music_theory_secrets: 'Music Theory Secrets',
  indiana_backflow: 'Indiana Backflow',
  first_keys_indy: 'First Keys Indy',
  funding_ready_indiana: 'Funding Ready',
}

const STATUS_COLOR: Record<string, string> = {
  draft: 'var(--text-muted)',
  needs_review: 'var(--state-warning)',
  approved: 'var(--state-success)',
  scheduled: 'var(--accent)',
  published: 'var(--state-success)',
  pending_review: 'var(--state-warning)',
  sent: 'var(--state-success)',
}

function composePostText(p: Record<string, unknown>): string {
  const hook = p.hook as string | null
  const body = p.body as string | null
  const cta = p.cta as string | null
  const hashtags = (p.hashtags as string[] | null) ?? []

  const parts: string[] = []
  if (hook) parts.push(hook)
  if (body && body !== hook) parts.push(body)
  if (cta) parts.push(cta)
  if (hashtags.length > 0) {
    parts.push(hashtags.map(t => t.startsWith('#') ? t : `#${t}`).join(' '))
  }
  return parts.join('\n\n')
}

export function LinkedInClient({ initialPosts, initialOutreach }: Props) {
  const [tab, setTab] = useState<Tab>('posts')
  const [posts, setPosts] = useState(initialPosts)
  const [outreach, setOutreach] = useState(initialOutreach)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('')

  async function copyAndOpen(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      // Open LinkedIn home with composer hint
      window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank', 'noopener,noreferrer')
      setTimeout(() => setCopiedId(null), 4000)
    } catch (err) {
      console.error('Clipboard failed:', err)
      alert('Copy failed — your browser blocked clipboard access')
    }
  }

  async function markAsSent(id: string, kind: 'post' | 'outreach') {
    try {
      const res = await fetch('/api/publish/linkedin-sent', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id, kind }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      // Update locally
      if (kind === 'post') {
        setPosts(posts.map(p => p.id === id ? { ...p, status: 'published', published_at: new Date().toISOString() } : p))
      } else {
        setOutreach(outreach.map(o => o.id === id ? { ...o, status: 'sent' } : o))
      }
    } catch (err) {
      console.error('Mark sent failed:', err)
      alert('Failed to mark as sent')
    }
  }

  const visiblePosts = posts.filter(p => !statusFilter || p.status === statusFilter)
  const visibleOutreach = outreach.filter(o => !statusFilter || o.status === statusFilter)

  const postStatusCounts: Record<string, number> = {}
  for (const p of posts) postStatusCounts[p.status as string] = (postStatusCounts[p.status as string] ?? 0) + 1

  const outreachStatusCounts: Record<string, number> = {}
  for (const o of outreach) outreachStatusCounts[o.status as string] = (outreachStatusCounts[o.status as string] ?? 0) + 1

  return (
    <div className="min-h-screen">
      <div className="px-10 pt-10 pb-6">
        <div className="max-w-5xl">
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>LinkedIn</h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--text-body)' }}>
            {posts.length} post draft{posts.length === 1 ? '' : 's'} · {outreach.length} outreach message{outreach.length === 1 ? '' : 's'}
          </p>

          {/* Tabs */}
          <div className="flex gap-1 mt-5">
            <button
              onClick={() => { setTab('posts'); setStatusFilter('') }}
              className="text-[12px] px-3 py-1.5 rounded transition-colors"
              style={{
                color: tab === 'posts' ? 'var(--text-primary)' : 'var(--text-body)',
                background: tab === 'posts' ? 'var(--bg-elevated)' : 'transparent',
              }}
            >
              Posts {tab === 'posts' && `· ${visiblePosts.length}`}
            </button>
            <button
              onClick={() => { setTab('outreach'); setStatusFilter('') }}
              className="text-[12px] px-3 py-1.5 rounded transition-colors"
              style={{
                color: tab === 'outreach' ? 'var(--text-primary)' : 'var(--text-body)',
                background: tab === 'outreach' ? 'var(--bg-elevated)' : 'transparent',
              }}
            >
              Outreach {tab === 'outreach' && `· ${visibleOutreach.length}`}
            </button>
          </div>

          {/* Status filter chips */}
          <div className="flex gap-1 mt-3 flex-wrap">
            <button onClick={() => setStatusFilter('')}
              className="text-[11px] px-2 py-0.5 rounded"
              style={{ color: !statusFilter ? 'var(--text-primary)' : 'var(--text-muted)', background: !statusFilter ? 'var(--bg-panel)' : 'transparent' }}>
              All
            </button>
            {Object.entries(tab === 'posts' ? postStatusCounts : outreachStatusCounts).map(([s, c]) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className="text-[11px] px-2 py-0.5 rounded capitalize"
                style={{ color: statusFilter === s ? 'var(--text-primary)' : 'var(--text-muted)', background: statusFilter === s ? 'var(--bg-panel)' : 'transparent' }}>
                {s.replace(/_/g, ' ')} <span style={{ color: 'var(--text-dim)' }}>{c}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* How-to banner */}
      <div className="px-10 pb-3">
        <div className="max-w-5xl">
          <div className="text-[11px] rounded px-3 py-2" style={{ color: 'var(--text-muted)', background: 'var(--bg-panel)', borderLeft: '2px solid var(--accent)' }}>
            <span style={{ color: 'var(--text-body)' }}>Workflow:</span> Click <strong style={{ color: 'var(--text-primary)' }}>Copy & open</strong> on any draft. The post is copied to your clipboard and LinkedIn opens in a new tab — paste with Cmd+V. Then click <strong style={{ color: 'var(--text-primary)' }}>Mark as sent</strong> when posted. Full LinkedIn API automation requires LinkedIn product approval (separate setup).
          </div>
        </div>
      </div>

      <div className="px-10 pb-12">
        <div className="max-w-5xl space-y-1">
          {tab === 'posts' ? (
            visiblePosts.length === 0 ? (
              <div className="py-12 text-center text-[13px]" style={{ color: 'var(--text-dim)' }}>
                No LinkedIn post drafts {statusFilter && 'matching this filter'}
              </div>
            ) : (
              visiblePosts.map(post => {
                const text = composePostText(post)
                const isCopied = copiedId === post.id
                const isPublished = post.status === 'published' || Boolean(post.published_at)
                return (
                  <div key={post.id as string} className="rounded p-4" style={{ background: 'var(--bg-panel)' }}>
                    <div className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: STATUS_COLOR[post.status as string] ?? 'var(--text-muted)' }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-3 flex-wrap">
                          <h3 className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{post.title as string}</h3>
                          <span className="text-[11px]" style={{ color: STATUS_COLOR[post.status as string] ?? 'var(--text-muted)' }}>
                            {(post.status as string).replace(/_/g, ' ')}
                          </span>
                          {Boolean(post.lane) && <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{LANE_LABELS[post.lane as string] ?? (post.lane as string)}</span>}
                          {Boolean(post.katrina_review_required) && (
                            <span className="text-[10px]" style={{ color: 'var(--state-warning)' }}>Katrina review required</span>
                          )}
                          <span className="text-[10px] ml-auto" style={{ color: 'var(--text-dim)' }}>
                            {new Date(post.created_at as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>

                        {/* Post body preview */}
                        <pre className="text-[12px] mt-3 p-3 rounded leading-relaxed whitespace-pre-wrap font-sans" style={{ color: 'var(--text-body)', background: 'var(--bg-canvas)' }}>
                          {text}
                        </pre>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => copyAndOpen(post.id as string, text)}
                            className="text-[11px] px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors"
                            style={{ color: 'var(--text-primary)', background: 'var(--bg-elevated)' }}
                          >
                            {isCopied ? <Check size={11} strokeWidth={1.5} /> : <Copy size={11} strokeWidth={1.5} />}
                            {isCopied ? 'Copied — paste in LinkedIn' : 'Copy & open LinkedIn'}
                            <ExternalLink size={10} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
                          </button>
                          {!isPublished && (
                            <button
                              onClick={() => markAsSent(post.id as string, 'post')}
                              className="text-[11px] px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors"
                              style={{ color: 'var(--state-success)' }}
                            >
                              <Send size={11} strokeWidth={1.5} />
                              Mark as sent
                            </button>
                          )}
                          {isPublished && (
                            <span className="text-[11px] flex items-center gap-1.5" style={{ color: 'var(--state-success)' }}>
                              <Check size={11} strokeWidth={1.5} />
                              Posted{post.published_at ? ` ${new Date(post.published_at as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )
          ) : (
            visibleOutreach.length === 0 ? (
              <div className="py-12 text-center text-[13px]" style={{ color: 'var(--text-dim)' }}>
                No LinkedIn outreach drafts {statusFilter && 'matching this filter'}
              </div>
            ) : (
              visibleOutreach.map(msg => {
                const body = msg.body as string
                const isCopied = copiedId === msg.id
                const isSent = msg.status === 'sent' || msg.status === 'connected'
                return (
                  <div key={msg.id as string} className="rounded p-4" style={{ background: 'var(--bg-panel)' }}>
                    <div className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: STATUS_COLOR[msg.status as string] ?? 'var(--text-muted)' }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-3 flex-wrap">
                          <span className="text-[12px] font-mono" style={{ color: 'var(--text-primary)' }}>
                            {(msg.message_type as string).replace(/_/g, ' ')}
                          </span>
                          <span className="text-[11px]" style={{ color: STATUS_COLOR[msg.status as string] ?? 'var(--text-muted)' }}>
                            {(msg.status as string).replace(/_/g, ' ')}
                          </span>
                          {Boolean(msg.lane) && <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{LANE_LABELS[msg.lane as string] ?? (msg.lane as string)}</span>}
                          <span className="text-[10px] ml-auto" style={{ color: 'var(--text-dim)' }}>
                            {new Date(msg.created_at as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>

                        {Boolean(msg.subject) && (
                          <div className="text-[12px] mt-2" style={{ color: 'var(--text-primary)' }}>
                            <span style={{ color: 'var(--text-dim)' }}>Subject: </span>
                            {msg.subject as string}
                          </div>
                        )}

                        <pre className="text-[12px] mt-2 p-3 rounded leading-relaxed whitespace-pre-wrap font-sans" style={{ color: 'var(--text-body)', background: 'var(--bg-canvas)' }}>
                          {body}
                        </pre>

                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => copyAndOpen(msg.id as string, body)}
                            className="text-[11px] px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors"
                            style={{ color: 'var(--text-primary)', background: 'var(--bg-elevated)' }}
                          >
                            {isCopied ? <Check size={11} strokeWidth={1.5} /> : <Copy size={11} strokeWidth={1.5} />}
                            {isCopied ? 'Copied — paste in LinkedIn' : 'Copy & open LinkedIn'}
                            <ExternalLink size={10} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
                          </button>
                          {!isSent && (
                            <button
                              onClick={() => markAsSent(msg.id as string, 'outreach')}
                              className="text-[11px] px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors"
                              style={{ color: 'var(--state-success)' }}
                            >
                              <Send size={11} strokeWidth={1.5} />
                              Mark as sent
                            </button>
                          )}
                          {isSent && (
                            <span className="text-[11px] flex items-center gap-1.5" style={{ color: 'var(--state-success)' }}>
                              <Check size={11} strokeWidth={1.5} />
                              Sent
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )
          )}
        </div>
      </div>
    </div>
  )
}
