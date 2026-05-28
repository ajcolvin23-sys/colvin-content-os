'use client'

import React, { useState, useRef, useEffect } from 'react'
import type { OrchestratorResponse, AgentName } from '@/lib/agents/types'

// ── Agent color config ────────────────────────────────────────────────────────
const AGENT_CONFIG: Record<AgentName, { color: string; bg: string; label: string; emoji: string }> = {
  gabriel: { color: '#7C3AED', bg: 'rgba(124,58,237,0.1)', label: 'Gabriel', emoji: '✍️' },
  solomon: { color: '#0EA5E9', bg: 'rgba(14,165,233,0.1)', label: 'Solomon', emoji: '🔍' },
  genius:  { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', label: 'Genius',  emoji: '⚡' },
}

// ── Suggested prompts ─────────────────────────────────────────────────────────
const SUGGESTIONS = [
  'Write me a TikTok video about why Black families still get denied for mortgages and how First Keys Indy helps',
  'Write a Facebook post about the $25k first-generation buyer program and optimize it to rank',
  'Build a full campaign for the Indiana Backflow Directory — content, SEO, and conversion',
  'Write hooks for a gospel piano TikTok and score them',
  'Create a landing page outline for Colvin Enterprises that ranks and converts',
]

export default function OrchestratorPage() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<OrchestratorResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'output' | 'plan' | 'agents'>('output')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  // Scroll to output on result
  useEffect(() => {
    if (result && outputRef.current) {
      outputRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [result])

  async function run() {
    if (!input.trim() || loading) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setResult(data)
      setActiveTab('output')
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') run()
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Hermes Orchestrator</h1>
          <p className="text-white/40 text-sm mt-0.5">Gabriel · Solomon · Genius — all in one command</p>
        </div>
        <div className="flex items-center gap-2">
          {(['gabriel', 'solomon', 'genius'] as AgentName[]).map(a => (
            <span
              key={a}
              className="text-xs font-semibold px-2.5 py-1 rounded-full border"
              style={{ color: AGENT_CONFIG[a].color, borderColor: AGENT_CONFIG[a].color + '40', background: AGENT_CONFIG[a].bg }}
            >
              {AGENT_CONFIG[a].emoji} {AGENT_CONFIG[a].label}
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Input */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tell the agents what you need... (⌘ + Enter to run)"
            rows={3}
            className="w-full bg-transparent text-white placeholder-white/25 text-base resize-none outline-none leading-relaxed"
          />
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
            <span className="text-white/30 text-xs">⌘ + Enter to run</span>
            <button
              onClick={run}
              disabled={!input.trim() || loading}
              className="px-6 py-2.5 bg-white text-black font-bold text-sm rounded-xl hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Running agents...' : 'Run →'}
            </button>
          </div>
        </div>

        {/* Suggestions */}
        {!result && !loading && (
          <div className="mb-8">
            <p className="text-white/30 text-xs font-semibold uppercase tracking-widest mb-3">Try these</p>
            <div className="flex flex-col gap-2">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setInput(s)}
                  className="text-left text-sm text-white/50 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.07] rounded-xl px-4 py-3 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="flex gap-3">
              {(['gabriel', 'solomon', 'genius'] as AgentName[]).map(a => (
                <div
                  key={a}
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl animate-pulse"
                  style={{ background: AGENT_CONFIG[a].bg, border: `1px solid ${AGENT_CONFIG[a].color}40` }}
                >
                  {AGENT_CONFIG[a].emoji}
                </div>
              ))}
            </div>
            <p className="text-white/40 text-sm">Agents are working...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-4 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div ref={outputRef}>
            {/* Execution summary */}
            <div className="flex items-center gap-4 mb-5">
              <div className="flex gap-2">
                {result.agents_used.map(a => (
                  <span
                    key={a}
                    className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: AGENT_CONFIG[a].bg, color: AGENT_CONFIG[a].color, border: `1px solid ${AGENT_CONFIG[a].color}40` }}
                  >
                    {AGENT_CONFIG[a].emoji} {AGENT_CONFIG[a].label}
                  </span>
                ))}
              </div>
              <span className="text-white/30 text-xs">{(result.execution_time_ms / 1000).toFixed(1)}s</span>
              <span className="text-white/30 text-xs">{result.plan.steps.length} step{result.plan.steps.length > 1 ? 's' : ''}</span>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-5 bg-white/5 rounded-xl p-1 w-fit">
              {[
                { id: 'output', label: 'Output' },
                { id: 'plan', label: 'Plan' },
                { id: 'agents', label: 'Agent Details' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-black'
                      : 'text-white/40 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Output Tab */}
            {activeTab === 'output' && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <p className="text-white/40 text-xs font-semibold uppercase tracking-widest">Final Output</p>
                  <button
                    onClick={() => navigator.clipboard.writeText(result.final_output)}
                    className="text-xs text-white/30 hover:text-white border border-white/10 hover:border-white/30 rounded-lg px-3 py-1.5 transition-all"
                  >
                    Copy
                  </button>
                </div>
                <div className="prose prose-invert prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-white/80 text-sm leading-relaxed font-sans">
                    {result.final_output}
                  </pre>
                </div>
              </div>
            )}

            {/* Plan Tab */}
            {activeTab === 'plan' && (
              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-2">Intent</p>
                  <p className="text-white text-base">{result.plan.intent}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-2">Reasoning</p>
                  <p className="text-white/70 text-sm leading-relaxed">{result.plan.reasoning}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-4">Execution Steps</p>
                  <div className="flex flex-col gap-3">
                    {result.plan.steps.map((step, i) => (
                      <div
                        key={i}
                        className="flex gap-4 p-4 rounded-xl"
                        style={{ background: AGENT_CONFIG[step.agent].bg, border: `1px solid ${AGENT_CONFIG[step.agent].color}30` }}
                      >
                        <div
                          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black"
                          style={{ background: AGENT_CONFIG[step.agent].color + '20', color: AGENT_CONFIG[step.agent].color }}
                        >
                          {i + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="text-xs font-bold"
                              style={{ color: AGENT_CONFIG[step.agent].color }}
                            >
                              {AGENT_CONFIG[step.agent].emoji} {AGENT_CONFIG[step.agent].label}
                            </span>
                            {step.run_parallel && (
                              <span className="text-xs text-white/30 border border-white/10 rounded px-1.5 py-0.5">parallel</span>
                            )}
                            {step.needs_prior_output && (
                              <span className="text-xs text-white/30 border border-white/10 rounded px-1.5 py-0.5">uses prior output</span>
                            )}
                          </div>
                          <p className="text-white/70 text-sm">{step.task}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Agent Details Tab */}
            {activeTab === 'agents' && (
              <div className="space-y-4">
                {result.results.map((r, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <div
                      className="flex items-center gap-3 px-5 py-3 border-b border-white/10"
                      style={{ background: AGENT_CONFIG[r.agent].bg }}
                    >
                      <span
                        className="text-sm font-bold"
                        style={{ color: AGENT_CONFIG[r.agent].color }}
                      >
                        {AGENT_CONFIG[r.agent].emoji} {AGENT_CONFIG[r.agent].label}
                      </span>
                      <span className={`text-xs ml-auto ${r.success ? 'text-green-400' : 'text-red-400'}`}>
                        {r.success ? '✓ success' : '✗ failed'}
                      </span>
                    </div>
                    <div className="p-5">
                      <p className="text-white/30 text-xs mb-2">Task given:</p>
                      <p className="text-white/60 text-sm mb-4">{r.task}</p>
                      {r.success && (
                        <>
                          <p className="text-white/30 text-xs mb-2">Output:</p>
                          <pre className="whitespace-pre-wrap text-white/80 text-sm leading-relaxed font-sans">
                            {r.output}
                          </pre>
                        </>
                      )}
                      {!r.success && r.error && (
                        <p className="text-red-400 text-sm">{r.error}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Run again */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => { setResult(null); setInput(''); textareaRef.current?.focus() }}
                className="text-sm text-white/40 hover:text-white border border-white/10 hover:border-white/30 rounded-xl px-4 py-2.5 transition-all"
              >
                New request
              </button>
              <button
                onClick={run}
                className="text-sm text-white/40 hover:text-white border border-white/10 hover:border-white/30 rounded-xl px-4 py-2.5 transition-all"
              >
                Run again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
