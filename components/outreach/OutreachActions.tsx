'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Action = 'approve' | 'reject' | 'revise' | 'mark_sent'

interface OutreachActionsProps {
  draftId: string
  currentStatus: string
  katinaRequired: boolean
  leadName: string
}

const ACTION_CONFIG: Record<string, { label: string; style: string; confirmStyle: string }> = {
  approve: {
    label: 'Approve',
    style: 'bg-emerald-700 hover:bg-emerald-600 text-white',
    confirmStyle: 'bg-emerald-600',
  },
  reject: {
    label: 'Reject',
    style: 'bg-red-900/60 hover:bg-red-800 text-red-300 border border-red-700/50',
    confirmStyle: 'bg-red-700',
  },
  revise: {
    label: 'Request Revision',
    style: 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-600',
    confirmStyle: 'bg-gray-700',
  },
  mark_sent: {
    label: 'Mark as Sent',
    style: 'bg-blue-700 hover:bg-blue-600 text-white',
    confirmStyle: 'bg-blue-600',
  },
}

export default function OutreachActions({
  draftId,
  currentStatus,
  katinaRequired,
  leadName,
}: OutreachActionsProps) {
  const router = useRouter()
  const [activeAction, setActiveAction] = useState<Action | null>(null)
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  if (done) {
    return (
      <div className="text-xs text-emerald-400 flex items-center gap-1.5">
        <span>✓</span>
        <span>Updated — refreshing…</span>
      </div>
    )
  }

  const submit = async () => {
    if (!activeAction) return
    if ((activeAction === 'revise' || activeAction === 'reject') && !feedback.trim()) {
      setError('Please add a note explaining why.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/outreach', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: draftId, action: activeAction, feedback: feedback.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.code === 'katrina_gate') {
          setError('Katrina compliance review required. Add a note confirming you have reviewed this draft.')
        } else {
          setError(data.error || 'Action failed')
        }
        return
      }
      setDone(true)
      setTimeout(() => router.refresh(), 500)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  const cancel = () => {
    setActiveAction(null)
    setFeedback('')
    setError('')
  }

  // Determine which actions are available for the current status
  const available: Action[] = (() => {
    if (currentStatus === 'pending_review') return ['approve', 'revise', 'reject']
    if (currentStatus === 'approved') return ['mark_sent', 'revise', 'reject']
    if (currentStatus === 'revised') return ['approve', 'reject']
    return []
  })()

  if (available.length === 0) return null

  return (
    <div className="mt-3">
      {/* Action buttons */}
      {!activeAction && (
        <div className="flex flex-wrap gap-2">
          {available.map(action => (
            <button
              key={action}
              onClick={() => setActiveAction(action)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${ACTION_CONFIG[action].style}`}
            >
              {ACTION_CONFIG[action].label}
            </button>
          ))}
        </div>
      )}

      {/* Confirm panel */}
      {activeAction && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 space-y-3">
          <p className="text-xs text-gray-300 font-semibold">
            {activeAction === 'approve' && `Approve draft for ${leadName}?`}
            {activeAction === 'reject' && `Reject draft for ${leadName}`}
            {activeAction === 'revise' && `Request revision for ${leadName}`}
            {activeAction === 'mark_sent' && `Mark as sent to ${leadName}?`}
          </p>

          {/* Katrina gate notice */}
          {activeAction === 'approve' && katinaRequired && (
            <div className="bg-orange-950/30 border border-orange-700/50 rounded-lg px-3 py-2 text-xs text-orange-300">
              ⚠ This draft is flagged for compliance review. Your note below confirms you have reviewed it.
            </div>
          )}

          {/* Feedback field — required for reject/revise, optional for approve (but required if katrina gate) */}
          <div>
            <label className="text-xs text-gray-500 block mb-1">
              {activeAction === 'approve' && katinaRequired
                ? 'Compliance confirmation note (required) *'
                : activeAction === 'approve'
                ? 'Note (optional)'
                : 'Reason (required) *'}
            </label>
            <textarea
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              rows={2}
              placeholder={
                activeAction === 'revise'
                  ? 'What needs to change?'
                  : activeAction === 'reject'
                  ? 'Why is this being rejected?'
                  : activeAction === 'approve' && katinaRequired
                  ? 'e.g. Reviewed for compliance — no guarantee language, disclaimer present'
                  : 'Optional note…'
              }
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-gray-400"
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex gap-2">
            <button
              onClick={submit}
              disabled={loading}
              className={`flex-1 text-xs font-semibold py-2 rounded-lg text-white transition-colors disabled:opacity-50 ${ACTION_CONFIG[activeAction].confirmStyle}`}
            >
              {loading ? 'Saving…' : `Confirm ${ACTION_CONFIG[activeAction].label}`}
            </button>
            <button
              onClick={cancel}
              disabled={loading}
              className="px-4 py-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
