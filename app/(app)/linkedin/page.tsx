'use client'
import { useState, useEffect } from 'react'
import type { OutreachProspect } from '@/types'

interface ProspectWithMessages extends OutreachProspect {
  outreach_messages?: Array<{
    id: string
    message_type: string
    body: string
    status: string
  }>
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-gray-800 text-gray-400',
  researched: 'bg-blue-900 text-blue-300',
  connection_sent: 'bg-purple-900 text-purple-300',
  connected: 'bg-indigo-900 text-indigo-300',
  messaged: 'bg-yellow-900 text-yellow-300',
  responded: 'bg-emerald-900 text-emerald-300',
  call_booked: 'bg-green-900 text-green-300',
  not_interested: 'bg-gray-800 text-gray-500',
}

export default function LinkedInPage() {
  const [tab, setTab] = useState<'post' | 'outreach'>('post')
  const [postForm, setPostForm] = useState({ topic: '', content_type: 'post', cta: '', additional_context: '' })
  const [prospectForm, setProspectForm] = useState({
    name: '', company: '', title: '', profile_url: '', location: '',
    industry: '', verified_signal: '', pain_hypothesis: '', offer_fit: '',
  })
  const [loading, setLoading] = useState(false)
  const [postResult, setPostResult] = useState<Record<string, unknown> | null>(null)
  const [prospects, setProspects] = useState<ProspectWithMessages[]>([])
  const [newProspect, setNewProspect] = useState<ProspectWithMessages | null>(null)
  const [drafts, setDrafts] = useState<{ connection_request: string; follow_up: string; risk_notes: string } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/outreach').then(r => r.json()).then(d => setProspects(Array.isArray(d) ? d : [])).catch(() => {})
  }, [newProspect])

  const generatePost = async () => {
    if (!postForm.topic.trim()) return
    setLoading(true); setError(''); setPostResult(null)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'content', lane: 'colvin_enterprises', platform: 'linkedin', ...postForm }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPostResult(data)
    } catch (e) { setError(String(e)) } finally { setLoading(false) }
  }

  const addProspect = async () => {
    if (!prospectForm.name.trim()) return
    setLoading(true); setError(''); setNewProspect(null); setDrafts(null)
    try {
      const res = await fetch('/api/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: 'linkedin', ...prospectForm, generate_drafts: true }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setNewProspect(data.prospect)
      setDrafts(data.drafts)
      setProspectForm({ name: '', company: '', title: '', profile_url: '', location: '', industry: '', verified_signal: '', pain_hypothesis: '', offer_fit: '' })
    } catch (e) { setError(String(e)) } finally { setLoading(false) }
  }

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">💼 LinkedIn</h1>
        <p className="text-gray-400 text-sm mt-1">Posts, articles, and outreach. All drafts — nothing sends without your approval.</p>
      </div>

      <div className="flex gap-2">
        {['post', 'outreach'].map(t => (
          <button key={t} onClick={() => setTab(t as 'post' | 'outreach')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            {t === 'post' ? '📝 Posts & Articles' : '🤝 Outreach'}
          </button>
        ))}
      </div>

      {tab === 'post' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Topic</label>
            <input value={postForm.topic} onChange={e => setPostForm(f => ({ ...f, topic: e.target.value }))}
              placeholder="e.g. Why your follow-up system is costing you leads"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Content type</label>
              <select value={postForm.content_type} onChange={e => setPostForm(f => ({ ...f, content_type: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white">
                <option value="post">Short post</option>
                <option value="article">Article / Long-form</option>
                <option value="carousel">Carousel outline</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">CTA</label>
              <input value={postForm.cta} onChange={e => setPostForm(f => ({ ...f, cta: e.target.value }))}
                placeholder="Book a free audit"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Context</label>
            <textarea value={postForm.additional_context} onChange={e => setPostForm(f => ({ ...f, additional_context: e.target.value }))}
              rows={2} placeholder="Target audience, angle, or anything else..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 resize-none" />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button onClick={generatePost} disabled={loading}
            className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors">
            {loading ? 'Generating...' : 'Generate LinkedIn Draft'}
          </button>

          {postResult && (
            <div className="space-y-3 pt-2">
              <div className="text-xs text-gray-500 font-medium">Generated draft — review before saving</div>
              {['hook', 'body', 'caption', 'cta'].map(k => postResult[k] ? (
                <div key={k}>
                  <div className="text-xs text-gray-600 mb-1">{k}</div>
                  <div className="bg-gray-800 rounded-lg p-3 text-sm text-gray-200 whitespace-pre-wrap">{String(postResult[k])}</div>
                </div>
              ) : null)}
              {Array.isArray(postResult.hashtags) && postResult.hashtags.length > 0 && (
                <div className="text-xs text-blue-400">{postResult.hashtags.map((h: string) => `#${h}`).join(' ')}</div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'outreach' && (
        <div className="space-y-5">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-white">Add Prospect</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'name', label: 'Name *', placeholder: 'John Smith' },
                { key: 'company', label: 'Company', placeholder: 'ABC Plumbing' },
                { key: 'title', label: 'Title', placeholder: 'Owner / CEO' },
                { key: 'profile_url', label: 'LinkedIn URL', placeholder: 'linkedin.com/in/...' },
                { key: 'location', label: 'Location', placeholder: 'Indianapolis, IN' },
                { key: 'industry', label: 'Industry', placeholder: 'HVAC / Plumbing' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs text-gray-400 mb-1 block">{label}</label>
                  <input value={prospectForm[key as keyof typeof prospectForm]} onChange={e => setProspectForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600" />
                </div>
              ))}
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Verified signal (what triggered this outreach)</label>
              <input value={prospectForm.verified_signal} onChange={e => setProspectForm(f => ({ ...f, verified_signal: e.target.value }))}
                placeholder="e.g. Posted about hiring a receptionist, website has no lead form"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Pain hypothesis</label>
                <input value={prospectForm.pain_hypothesis} onChange={e => setProspectForm(f => ({ ...f, pain_hypothesis: e.target.value }))}
                  placeholder="e.g. Manual follow-up, no CRM"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Offer fit</label>
                <input value={prospectForm.offer_fit} onChange={e => setProspectForm(f => ({ ...f, offer_fit: e.target.value }))}
                  placeholder="e.g. AI lead follow-up system"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600" />
              </div>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button onClick={addProspect} disabled={loading}
              className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors">
              {loading ? 'Generating drafts...' : 'Add Prospect + Generate Drafts'}
            </button>
          </div>

          {drafts && (
            <div className="bg-gray-900 border border-emerald-800 rounded-xl p-6 space-y-4">
              <div className="text-emerald-400 text-sm font-semibold">✓ Prospect saved — drafts below need your review before sending</div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Connection request (max 300 chars)</div>
                <div className="bg-gray-800 rounded-lg p-3 text-sm text-gray-200">{drafts.connection_request}</div>
                <div className="text-xs text-gray-600 mt-1">{drafts.connection_request?.length}/300 chars</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Follow-up message</div>
                <div className="bg-gray-800 rounded-lg p-3 text-sm text-gray-200 whitespace-pre-wrap">{drafts.follow_up}</div>
              </div>
              {drafts.risk_notes && (
                <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-3 text-xs text-yellow-300">
                  ⚠️ Verify before sending: {drafts.risk_notes}
                </div>
              )}
              <p className="text-gray-500 text-xs">These are saved as drafts. Go to Approvals to review and mark as ready to send.</p>
            </div>
          )}

          {prospects.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-400 mb-3">Prospects ({prospects.length})</h2>
              <div className="space-y-2">
                {prospects.map(p => (
                  <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-white text-sm font-medium">{p.name}</div>
                        <div className="text-gray-500 text-xs">{p.title}{p.company ? ` @ ${p.company}` : ''}</div>
                        {p.verified_signal && <div className="text-gray-600 text-xs mt-1">Signal: {p.verified_signal}</div>}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status] || 'bg-gray-800 text-gray-400'}`}>{p.status}</span>
                    </div>
                    {p.outreach_messages && p.outreach_messages.length > 0 && (
                      <div className="mt-2 text-xs text-gray-600">{p.outreach_messages.length} draft{p.outreach_messages.length !== 1 ? 's' : ''} · {p.outreach_messages[0].status}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
