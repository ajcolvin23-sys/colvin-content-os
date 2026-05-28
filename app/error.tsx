'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to console in dev; swap for real error reporting in production
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 max-w-md w-full text-center space-y-4">
        <div className="text-4xl">⚠</div>
        <h2 className="text-white font-bold text-lg">Something went wrong</h2>
        <p className="text-gray-400 text-sm">
          {error.message || 'An unexpected error occurred. No data was changed.'}
        </p>
        {error.digest && (
          <p className="text-gray-600 text-xs font-mono">Error ID: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
