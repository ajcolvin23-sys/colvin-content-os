'use client'
import { useState } from 'react'

const POST_TYPES = [
  { value: 'educational', label: 'Educational' },
  { value: 'local_awareness', label: 'Local Awareness' },
  { value: 'buyer_guide', label: 'Buyer Guide' },
  { value: 'faq', label: 'FAQ / Q&A' },
  { value: 'lead_generation', label: 'Lead Generation' },
]

export default function BackflowFacebookPage() {
  const [form, setForm] = useState({
    topic: '', post_type: 'educational', location: 'Indianapolis, Indiana',
    audience: 'property owners, businesses, churches', cta: 'Find a certified tester in your area',
    source_notes: '', additional_context: '',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const generate = async () => {
    if (!form.topic.trim()) { setError('Topic is required'); return }
    setLoading(true); setError(''); setResult(null); setSaved(false)
    const context = [
      `Post type: ${form.post_type}`,
      `Location: ${form.location}`,
      `Audience: ${form.audience}`,
      form.source_notes ? `Source notes: ${form.source_notes}` : '',
      form.additional_context,
    ].filter(Boolean).join('. ')

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'content', lane: 'backflow', platform: 'facebook',
          content_type: 'post', topic: form.topic,
          cta: form.cta, additional_context: context,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setResult(data)
    } catch (e) { setError(String(e)) } finally { setLoading(false) }
  }

  const save = async () => {
    if (!result) return
    setLoading(true)
    try {
      await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lane: 'backflow', platform: 'facebook', content_type: 'post',
          title: form.topic, hook: result.hook, body: result.body,
          caption: result.caption, cta: result.cta,
          hashtags: result.hashtags || [],
          visual_direction: result.visual_direction,
          status: 'needs_review',
        }),
      })
      setSaved(true)
    } catch (e) { setError(String(e)) } finally { setLoading(false) }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">💧 Backflow Facebook Content</h1>
        <p className="text-gray-400 text-sm mt-1">
          Educational and local awareness posts for the Indiana Backflow Directory Facebook page.
        </p>
        <a href="https://www.facebook.com/IndianaBackflowDirectory/" target="_blank" rel="noopener noreferrer"
          className="text-xs text-blue-400 hover:underline mt-1 inline-block">
          → facebook.com/IndianaBackflowDirectory
        </a>
      </div>

      <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-xl p-4 text-xs text-yellow-400">
        ⚠️ Safety rule: Do not make unverified claims about certification requirements, legal mandates, or specific pricing.
        Use source_notes to document any regulatory claims before generation.
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Post topic *</label>
          <input value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
            placeholder="e.g. What is backflow testing and who needs it?"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Post type</label>
            <select value={form.post_type} onChange={e => setForm(f => ({ ...f, post_type: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white">
              {POST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Location focus</label>
            <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">Target audience</label>
          <input value={form.audience} onChange={e => setForm(f => ({ ...f, audience: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" />
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">Source notes (cite any regulatory/certification claims here)</label>
          <textarea value={form.source_notes} onChange={e => setForm(f => ({ ...f, source_notes: e.target.value }))}
            rows={2} placeholder="e.g. Per Indianapolis DPW, annual testing required for irrigation systems over 1/2 inch — source: [url]"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 resize-none" />
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">CTA</label>
          <input value={form.cta} onChange={e => setForm(f => ({ ...f, cta: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button onClick={generate} disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors">
          {loading ? 'Generating...' : 'Generate Facebook Post'}
        </button>
      </div>

      {result && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-300">Generated Draft</h2>
          {[
            { label: 'Post', value: result.body || result.caption },
            { label: 'Caption', value: result.caption },
            { label: 'CTA', value: result.cta },
            { label: 'Visual direction', value: result.visual_direction },
          ].map(({ label, value }) => value ? (
            <div key={label}>
              <div className="text-xs text-gray-500 mb-1">{label}</div>
              <div className="bg-gray-800 rounded-lg p-3 text-sm text-gray-200 whitespace-pre-wrap">{String(value)}</div>
            </div>
          ) : null)}

          {Array.isArray(result.hashtags) && result.hashtags.length > 0 && (
            <div className="text-xs text-blue-400">{result.hashtags.map((h: string) => `#${h}`).join(' ')}</div>
          )}

          <div className="flex gap-3">
            <button onClick={save} disabled={loading || saved}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors">
              {saved ? '✓ Saved to Approvals' : 'Save for Review'}
            </button>
            <button onClick={generate} disabled={loading}
              className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors">
              Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
