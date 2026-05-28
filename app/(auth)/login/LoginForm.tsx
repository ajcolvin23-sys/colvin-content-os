'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [magicSent, setMagicSent] = useState(false)
  const [mode, setMode] = useState<'password' | 'magic'>('magic')

  const supabase = createClient()

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) { setError('Email is required'); return }
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    setMagicSent(true)
  }

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) { setError('Email and password are required'); return }
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    router.push(next)
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">

        <div className="text-center">
          <div className="text-3xl font-black text-white mb-1">Colvin Content OS</div>
          <div className="text-gray-500 text-sm">Operator access — Alfred Colvin</div>
        </div>

        {magicSent ? (
          <div className="bg-emerald-950/40 border border-emerald-700 rounded-xl p-6 text-center space-y-2">
            <div className="text-2xl">📬</div>
            <p className="text-emerald-400 font-semibold text-sm">Check your email</p>
            <p className="text-gray-400 text-xs">
              A sign-in link was sent to <span className="text-white">{email}</span>.
              Click it to access the dashboard.
            </p>
            <button
              onClick={() => { setMagicSent(false); setEmail('') }}
              className="text-xs text-gray-500 hover:text-gray-300 underline mt-2"
            >
              Try a different email
            </button>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">

            <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => { setMode('magic'); setError('') }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${mode === 'magic' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Magic Link
              </button>
              <button
                onClick={() => { setMode('password'); setError('') }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${mode === 'password' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Password
              </button>
            </div>

            <form onSubmit={mode === 'magic' ? handleMagicLink : handlePassword} className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
                />
              </div>

              {mode === 'password' && (
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
                  />
                </div>
              )}

              {error && (
                <p className="text-red-400 text-xs bg-red-950/30 border border-red-800/40 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
              >
                {loading ? 'Signing in…' : mode === 'magic' ? 'Send Magic Link' : 'Sign In'}
              </button>
            </form>
          </div>
        )}

        <p className="text-center text-gray-700 text-xs">
          Private system — authorized access only
        </p>
      </div>
    </div>
  )
}
