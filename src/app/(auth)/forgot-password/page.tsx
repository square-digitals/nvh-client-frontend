'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, ArrowLeft } from 'lucide-react'
import AuthShell from '@/components/AuthShell'
import { api } from '@/lib/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      await api.post('/api/auth/forgot-password', { email })
    } catch {
      // always show success — API intentionally returns 200 regardless
    } finally {
      setSubmitting(false)
      setSubmitted(true)
    }
  }

  return (
    <AuthShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Reset your password</h1>
          <p className="mt-1 text-sm text-slate-500">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              If that email is registered, you&apos;ll receive a reset link shortly.
            </div>
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? 'Sending…' : 'Send reset link'}
            </button>

            <Link
              href="/login"
              className="flex items-center justify-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </form>
        )}
      </div>
    </AuthShell>
  )
}
