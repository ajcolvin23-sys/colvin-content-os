'use client'
import { useState, useEffect } from 'react'
import type { VideoProject } from '@/types'

interface VideoWithSlides extends VideoProject {
  video_slides?: Array<{
    slide_order: number
    text_on_screen: string
    voiceover_text: string
    duration_seconds: number
    transition: string
  }>
  render_settings?: Record<string, unknown>
}

interface GenerateResult {
  project: VideoWithSlides
  script: {
    hook: string
    thumbnail_text: string
    caption: string
    hashtags: string[]
    cta: string
    slides: Array<{
      order: number
      text_on_screen: string
      voiceover_text: string
      visual_direction: string
      duration_seconds: number
    }>
    full_voiceover: string
  }
}

export default function PianoVideosPage() {
  const [form, setForm] = useState({
    title: '', topic: '', platform: 'tiktok', lesson_objective: '',
    cta: 'Follow for more piano tips', book_page_description: '', slide_count: 7,
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GenerateResult | null>(null)
  const [projects, setProjects] = useState<VideoWithSlides[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/video').then(r => r.json()).then(setProjects).catch(() => {})
  }, [result])

  const generate = async () => {
    if (!form.topic.trim()) { setError('Topic is required'); return }
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setResult(data)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">🎹 Piano Slideshow Videos</h1>
        <p className="text-gray-400 text-sm mt-1">Build vertical 9:16 slideshow videos for TikTok or YouTube Shorts from your piano lessons.</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Project title</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="My piano lesson title"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Platform</label>
            <select value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white">
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube Shorts</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">Lesson topic *</label>
          <input value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
            placeholder="e.g. The number system for gospel piano"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600" />
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">Lesson objective</label>
          <input value={form.lesson_objective} onChange={e => setForm(f => ({ ...f, lesson_objective: e.target.value }))}
            placeholder="What will the viewer learn or be able to do?"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600" />
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">Book page / app screenshot description</label>
          <textarea value={form.book_page_description} onChange={e => setForm(f => ({ ...f, book_page_description: e.target.value }))}
            rows={2} placeholder="Describe what's on the page or screenshot — chords shown, diagram type, key concept..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">CTA</label>
            <input value={form.cta} onChange={e => setForm(f => ({ ...f, cta: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Number of slides ({form.slide_count})</label>
            <input type="range" min={4} max={10} value={form.slide_count} onChange={e => setForm(f => ({ ...f, slide_count: +e.target.value }))}
              className="w-full mt-2" />
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button onClick={generate} disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors">
          {loading ? 'Building script...' : '🎬 Generate Video Script'}
        </button>
      </div>

      {result && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">{result.project.title}</h2>
            <span className="text-xs bg-purple-900 text-purple-300 px-2 py-1 rounded">script ready</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-gray-500 mb-1">Hook</div>
              <div className="text-white">{result.script.hook}</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-gray-500 mb-1">Thumbnail text</div>
              <div className="text-white">{result.script.thumbnail_text}</div>
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-500 mb-2">Slides ({result.script.slides?.length})</div>
            <div className="space-y-2">
              {result.script.slides?.map((slide, i) => (
                <div key={i} className="bg-gray-800 rounded-lg px-3 py-2">
                  <div className="flex gap-3 items-start">
                    <span className="text-xs text-gray-500 w-5 shrink-0">{slide.order}.</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium">{slide.text_on_screen}</div>
                      <div className="text-gray-400 text-xs mt-0.5">🎙 {slide.voiceover_text}</div>
                      {slide.visual_direction && (
                        <div className="text-gray-600 text-xs mt-0.5">📷 {slide.visual_direction}</div>
                      )}
                    </div>
                    <span className="text-xs text-gray-600 shrink-0">{slide.duration_seconds}s</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Full voiceover script</div>
            <div className="text-sm text-gray-200 whitespace-pre-wrap">{result.project.voiceover_script}</div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-gray-500 mb-1">Caption</div>
              <div className="text-white">{(result.project.render_settings as { caption?: string })?.caption}</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-gray-500 mb-1">Hashtags</div>
              <div className="text-white">{((result.project.render_settings as { hashtags?: string[] })?.hashtags || []).map((h: string) => `#${h}`).join(' ')}</div>
            </div>
          </div>

          <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-3 text-xs text-blue-300">
            📋 Script saved. Next steps: Record voiceover using the script above → Upload slides + audio → Export MP4 → Go to Approvals to schedule posting.
          </div>
        </div>
      )}

      {projects.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 mb-3">Previous Projects ({projects.length})</h2>
          <div className="space-y-2">
            {projects.map(p => (
              <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm text-white">{p.title}</div>
                  <div className="text-xs text-gray-500">{p.platform} · {p.video_slides?.length || 0} slides</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${p.render_status === 'rendered' ? 'bg-emerald-900 text-emerald-300' : 'bg-gray-800 text-gray-400'}`}>
                  {p.render_status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
