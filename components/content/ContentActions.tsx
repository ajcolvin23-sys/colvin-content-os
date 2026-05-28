'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

const KATRINA_LANES = ['first_keys_indy', 'funding_ready_indiana', 'girls_got_game']

type Action = 'approve' | 'reject' | 'needs_review' | 'mark_published'

interface Props {
  itemId: string
  currentStatus: string
  lane: string
  katinaRequired: boolean
}

const ACTION_CONFIG: Record<Action, { label: string; confirm: string; style: string; requiresFeedback?: boolean }> = {
  approve: {
    label: 'Approve',
    confirm: 'Mark this content as approved for scheduling?',
    style: 'bg-green-700 hover:bg-green-600 text-white',
  },
  reject: {
    label: 'Reject',
    confirm: 'Reject this content? It will be archived.',
    style: 'bg-red-900 hover:bg-red-800 text-red-300',
    requiresFeedback: true,
  },
  needs_review: {
    label: 'Send to Review',
    confirm: 'Flag this for review?',
    style: 'bg-yellow-900 hover:bg-yellow-800 text-yellow-300',
  },
  mark_published: {
    label: 'Mark Published',
    confirm: 'Confirm you have manually published this content?',
    style: 'bg-emerald-900 hover:bg-emerald-800 text-emerald-300',
  },
}

function getAvailableActions(status: string, katinaRequired: boolean): Action[] {
  if (katinaRequired) return [] // Block all actions until Katrina reviews
  switch (status) {
    case 'draft':
    case 'needs_review':
      return ['approve', 'reject']
    case 'approved':
      return ['mark_published', 'reject']
    case 'scheduled':
      return ['mark_published']
    default:
      return []
  }
}

export default function ContentActions({ itemId, currentStatus, lane, katinaRequired }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [confirmAction, setConfirmAction] = useState<Action | null>(null)
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const availableActions = getAvailableActions(currentStatus, katinaRequired)

  if (katinaRequired) {
    return (
      <div className="text-xs text-orange-400 bg-orange-950/20 border border-orange-800/40 rounded-lg px-3 py-2 mt-2">
        ⚠ Pending Katrina compliance review — actions locked until reviewed.
      </div>
    )
  }

  if (availableActions.length === 0) {
    return (
      <div className="text-xs text-gray-600 mt-2">
        {currentStatus === 'published' ? '✓ Published' : currentStatus === 'rejected' ? '✗ Rejected' : `Status: ${currentStatus}`}
      </div>
    )
  }

  async function executeAction(action: Action) {
    setError('')
    setSuccess('')

    const statusMap: Record<Action, string> = {
      approve: 'approved',
      reject: 'rejected',
      needs_review: 'needs_review',
      mark_published: 'published',
    }

    try {
      const res = await fetch(`/api/content/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: statusMap[action],
          ...(feedback && { notes: feedback }),
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Request failed (${res.status})`)
      }

      setSuccess(`${ACTION_CONFIG[action].label} — saved.`)
      setConfirmAction(null)
      setFeedback('')
      startTransition(() => router.refresh())
    } catch (e) {
      setError(String(e))
    }
  }

  if (confirmAction) {
    const cfg = ACTION_CONFIG[confirmAction]
    return (
      <div className="mt-2 bg-gray-800 border border-gray-700 rounded-lg p-3 space-y-3">
        <p className="text-sm text-gray-300">{cfg.confirm}</p>
        {cfg.requiresFeedback && (
          <textarea
            className="w-full bg-gray-900 border border-gray-700 rounded text-sm text-gray-200 p-2 resize-none focus:outline-none focus:border-blue-600"
            rows={2}
            placeholder="Optional notes..."
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
          />
        )}
        {error && <p className="text-xs text-red-400">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={() => executeAction(confirmAction)}
            disabled={isPending}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${cfg.style} disabled:opacity-50`}
          >
            {isPending ? 'Saving…' : 'Confirm'}
          </button>
          <button
            onClick={() => { setConfirmAction(null); setFeedback(''); setError('') }}
            className="text-xs px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-700 text-gray-400 hover:border-gray-500 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-2 space-y-2">
      {success && <p className="text-xs text-green-400">{success}</p>}
      <div className="flex flex-wrap gap-2">
        {availableActions.map(action => (
          <button
            key={action}
            onClick={() => setConfirmAction(action)}
            disabled={isPending}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${ACTION_CONFIG[action].style}`}
          >
            {ACTION_CONFIG[action].label}
          </button>
        ))}
      </div>
    </div>
  )
}
