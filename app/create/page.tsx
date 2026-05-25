'use client'
import { useState } from 'react'

const LANES = [
  { value: 'piano', label: '🎹 Piano / Music Theory' },
  { value: 'backflow', label: '💧 Backflow / Directory' },
  { value: 'linkedin', label: '💼 LinkedIn / Business' },
  { value: 'colvin_enterprises', label: '⚡ Colvin Enterprises' },
]
const PLATFORMS = [
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube Shorts' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'multi', label: 'Multi-platform' },
]
const CONTENT_TYPES = [
  { value: 'post', label: 'Post' },
  { value: 'video', label: 'Video script' },
  { value: 'article', label: 'Article / Long-form' },
  { value: 'carousel', label: 'Carousel outline' },
]
const HOOK_COLORS: Record<string, { bg: string; border: string; badge: string; label: string }> = {
  story:    { bg: 'bg-violet-950/40', border: 'border-violet-700', badge: 'bg-violet-700 text-white', label: 'Story Hook' },
  pain:     { bg: 'bg-rose-950/40',   border: 'border-rose-700',   badge: 'bg-rose-700 text-white',   label: 'Pain Hook' },
  curiosity:{ bg: 'bg-amber-950/40',  border: 'border-amber-600',  badge: 'bg-amber-600 text-black',  label: 'Curiosity Hook' },
}

interface GeneratedContent {
  hook: string; body: string; caption: string; cta: string
  hashtags: string[]; visual_direction: string; content_item_id?: string
}
interface ScoreBreakdown {
  hook_strength: number; body_clarity: number; cta_power: number; platform_fit: number; total: number
}
interface ConversionVariant {
  hook_type: 'story' | 'pain' | 'curiosity'; hook_type_label: string
  hook: string; body: string; caption: string; cta: string
  hashtags: string[]; visual_direction: string
  scores: ScoreBreakdown; score_reasoning: string
}
interface ConversionOptimizedResult {
  variants: ConversionVariant[]; winner_index: number; winner_reasoning: string
}

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.round((value / max) * 100)
  const color = pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-rose-500'
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-gray-400 w-24 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-700 rounded-full h-1.5">
        <div className={`${color} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-gray-300 w-10 text-right">{value}/{max}</span>
    </div>
  )
}

function ScoreRing({ total }: { total: number }) {
  const color = total >= 80 ? 'text-emerald-400' : total >= 65 ? 'text-yellow-400' : 'text-rose-400'
  return (
    <div className={`text-2xl font-black ${color}`}>{total}<span className="text-xs font-normal text-gray-500">/100</span></div>
  )
}

function VariantCard({
  variant, index, isWinner, isSelected, onSelect, onSave, saving
}: {
  variant: ConversionVariant; index: number; isWinner: boolean
  isSelected: boolean; onSelect: () => void; onSave: () => void; saving: boolean
}) {
  const [expanded, setExpanded] = useState(index === 0)
  const style = HOOK_COLORS[variant.hook_type] ?? HOOK_COLORS.story

  return (
    <div className={`rounded-xl border-2 transition-all ${style.bg} ${isSelected ? style.border : 'border-gray-700'} overflow-hidden`}>
      {/* Card header */}
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={() => setExpanded(e => !e)}>
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${style.badge}`}>{style.label}</span>
        {isWinner && (
          <span className="text-xs font-semibold bg-emerald-700 text-white px-2 py-0.5 rounded">⭐ AI Pick</span>
        )}
        <div className="ml-auto flex items-center gap-3">
          <ScoreRing total={variant.scores.total} />
          <svg className={`w-4 h-4 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-700/50 pt-3">
          {/* Score bars */}
          <div className="space-y-1.5 bg-gray-900/50 rounded-lg p-3">
            <ScoreBar label="Hook strength" value={variant.scores.hook_strength} max={40} />
            <ScoreBar label="Body clarity" value={variant.scores.body_clarity} max={30} />
            <ScoreBar label="CTA power" value={variant.scores.cta_power} max={20} />
            <ScoreBar label="Platform fit" value={variant.scores.platform_fit} max={10} />
          </div>
          <p className="text-xs text-gray-400 italic">{variant.score_reasoning}</p>

          {/* Content fields */}
          {[
            { label: 'Hook', value: variant.hook },
            { label: 'Body', value: variant.body },
            { label: 'Caption', value: variant.caption },
            { label: 'CTA', value: variant.cta },
            { label: 'Hashtags', value: variant.hashtags?.join(' ') },
            { label: 'Visual direction', value: variant.visual_direction },
          ].map(({ label, value }) => value ? (
            <div key={label}>
              <div className="text-xs text-gray-500 mb-1">{label}</div>
              <div className="bg-gray-900 rounded-lg px-3 py-2 text-sm text-gray-200 whitespace-pre-wrap">{value}</div>
            </div>
          ) : null)}

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onSelect}
              className={`flex-1 font-semibold py-2 rounded-lg text-sm transition-colors ${
                isSelected ? 'bg-blue-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
            >
              {isSelected ? '✓ Selected' : 'Select This Variant'}
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {saving ? 'Saving...' : 'Save for Review'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CreatePage() {
  const [mode, setMode] = useState<'quick' | 'optimizer'>('quick')
  const [form, setForm] = useState({
    lane: 'colvin_enterprises', platform: 'linkedin', content_type: 'post',
    topic: '', target_audience: '', cta: '', additional_context: '', tone: 'professional',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GeneratedContent | null>(null)
  const [optimizerResult, setOptimizerResult] = useState<ConversionOptimizedResult | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null)
  const [saved, setSaved] = useState(false)
  const [savingVariant, setSavingVariant] = useState<number | null>(null)
  const [error, setError] = useState('')

  const resetResults = () => { setResult(null); setOptimizerResult(null); setSaved(false); setSelectedVariant(null) }

  const generate = async () => {
    if (!form.topic.trim()) { setError('Topic is required'); return }
    setLoading(true); setError(''); resetResults()
    try {
      const apiType = mode === 'optimizer' ? 'conversion_optimized' : 'content'
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: apiType, ...form }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      if (mode === 'optimizer') {
        setOptimizerResult(data)
        setSelectedVariant(data.winner_index ?? 0)
      } else {
        setResult(data)
      }
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  const saveVariant = async (variantIndex: number) => {
    if (!optimizerResult) return
    const variant = optimizerResult.variants[variantIndex]
    setSavingVariant(variantIndex)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'content',
          ...form,
          save_to_db: true,
          // Pass winner content directly
          override_content: {
            hook: variant.hook,
            body: variant.body,
            caption: variant.caption,
            cta: variant.cta,
            hashtags: variant.hashtags,
            visual_direction: variant.visual_direction,
          },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSaved(true)
    } catch (e) {
      setError(String(e))
    } finally {
      setSavingVariant(null)
    }
  }

  const saveAndReview = async () => {
    if (!result) return
    setLoading(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'content', ...form, save_to_db: true }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data); setSaved(true)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Create Content</h1>
        <p className="text-gray-400 text-sm mt-1">Generate content for any lane. Everything goes to draft — nothing posts without your approval.</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1">
        <button
          onClick={() => { setMode('quick'); resetResults() }}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-colors ${mode === 'quick' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
        >
          ⚡ Quick Generate
        </button>
        <button
          onClick={() => { setMode('optimizer'); resetResults() }}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-colors ${mode === 'optimizer' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
        >
          🎯 Conversion Optimizer
        </button>
      </div>
      {mode === 'optimizer' && (
        <p className="text-xs text-gray-500 -mt-3 px-1">
          Generates 3 variants (Story • Pain • Curiosity hooks) — each scored 0–100. AI picks the winner, you choose what to save.
        </p>
      )}

      {/* Form */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Lane</label>
            <select value={form.lane} onChange={e => setForm(f => ({ ...f, lane: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white">
              {LANES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Platform</label>
            <select value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white">
              {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Content type</label>
            <select value={form.content_type} onChange={e => setForm(f => ({ ...f, content_type: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white">
              {CONTENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">Topic *</label>
          <input value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
            placeholder="e.g. Why most beginners miss the number system"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Target audience</label>
            <input value={form.target_audience} onChange={e => setForm(f => ({ ...f, target_audience: e.target.value }))}
              placeholder="e.g. Church musicians, business owners"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">CTA</label>
            <input value={form.cta} onChange={e => setForm(f => ({ ...f, cta: e.target.value }))}
              placeholder="e.g. Book a free audit"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600" />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">Additional context</label>
          <textarea value={form.additional_context} onChange={e => setForm(f => ({ ...f, additional_context: e.target.value }))}
            rows={2} placeholder="Anything else Gabriel should know..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 resize-none" />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button onClick={generate} disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors">
          {loading
            ? (mode === 'optimizer' ? 'Generating 3 variants...' : 'Generating...')
            : (mode === 'optimizer' ? '🎯 Generate 3 Conversion Variants' : '⚡ Generate Content')
          }
        </button>
      </div>

      {/* Quick Generate result */}
      {result && mode === 'quick' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-300">Generated Draft</h2>
            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">draft — not saved yet</span>
          </div>

          {[
            { label: 'Hook', value: result.hook },
            { label: 'Body', value: result.body },
            { label: 'Caption', value: result.caption },
            { label: 'CTA', value: result.cta },
            { label: 'Hashtags', value: result.hashtags?.join(' ') },
            { label: 'Visual direction', value: result.visual_direction },
          ].map(({ label, value }) => value ? (
            <div key={label}>
              <div className="text-xs text-gray-500 mb-1">{label}</div>
              <div className="bg-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200 whitespace-pre-wrap">{value}</div>
            </div>
          ) : null)}

          <div className="flex gap-3 pt-2">
            <button onClick={saveAndReview} disabled={loading || saved}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors">
              {saved ? '✓ Saved to Approval Queue' : 'Save for Review'}
            </button>
            <button onClick={generate} disabled={loading}
              className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors">
              Regenerate
            </button>
          </div>
          {saved && result.content_item_id && (
            <p className="text-emerald-400 text-xs">Saved. Go to <a href="/approvals" className="underline">Approvals</a> to review.</p>
          )}
        </div>
      )}

      {/* Conversion Optimizer result */}
      {optimizerResult && mode === 'optimizer' && (
        <div className="space-y-4">
          {/* Winner banner */}
          <div className="bg-emerald-950/50 border border-emerald-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-emerald-400 font-bold text-sm">⭐ AI Recommendation</span>
            </div>
            <p className="text-gray-300 text-sm">{optimizerResult.winner_reasoning}</p>
          </div>

          {/* 3 variant cards */}
          {optimizerResult.variants.map((variant, i) => (
            <VariantCard
              key={i}
              variant={variant}
              index={i}
              isWinner={i === optimizerResult.winner_index}
              isSelected={selectedVariant === i}
              onSelect={() => setSelectedVariant(i)}
              onSave={() => saveVariant(i)}
              saving={savingVariant === i}
            />
          ))}

          {/* Save selected */}
          {selectedVariant !== null && !saved && (
            <button
              onClick={() => saveVariant(selectedVariant)}
              disabled={savingVariant !== null}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {savingVariant !== null ? 'Saving...' : `Save ${HOOK_COLORS[optimizerResult.variants[selectedVariant]?.hook_type]?.label ?? 'Selected'} for Review`}
            </button>
          )}

          {saved && (
            <div className="bg-emerald-950/50 border border-emerald-700 rounded-xl p-4 text-center">
              <p className="text-emerald-400 font-semibold">✓ Saved to Approval Queue</p>
              <p className="text-gray-400 text-sm mt-1">Go to <a href="/approvals" className="underline text-emerald-400">Approvals</a> to review and schedule.</p>
            </div>
          )}

          <button onClick={generate} disabled={loading}
            className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-xl transition-colors">
            🔄 Regenerate All Variants
          </button>
        </div>
      )}
    </div>
  )
}
