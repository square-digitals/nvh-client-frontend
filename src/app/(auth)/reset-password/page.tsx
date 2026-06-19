'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, ArrowLeft } from 'lucide-react'
import AuthShell from '@/components/AuthShell'
import { api } from '@/lib/api'
import type { ApiError } from '@/lib/api'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const token = searchParams.get('token') ?? ''
  const email = searchParams.get('email') ?? ''

  const [form, setForm] = useState({ password: '', password_confirmation: '' })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
      setError(null)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      await api.post('/api/auth/reset-password', { token, email, ...form })
      router.replace('/login?reset=1')
    } catch (err) {
      const e = err as ApiError
      if (e.status === 422 && e.errors) {
        if (e.errors.token?.some((m) => m.toLowerCase().includes('invalid'))) {
          setError('This reset link has expired. Please request a new one.')
        } else {
          const first = Object.values(e.errors)[0]?.[0]
          setError(first ?? e.message)
        }
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (!token || !email) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Invalid or missing reset link. Please request a new one.
        </div>
        <Link
          href="/forgot-password"
          className="flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Request new link
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Choose a new password</h1>
        <p className="mt-1 text-sm text-slate-500">
          Resetting password for <span className="font-medium text-slate-700">{email}</span>
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
            New password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={form.password}
            onChange={set('password')}
            placeholder="••••••••"
            className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
          />
        </div>

        <div>
          <label htmlFor="password_confirmation" className="block text-sm font-medium text-slate-700 mb-1.5">
            Confirm new password
          </label>
          <input
            id="password_confirmation"
            type="password"
            autoComplete="new-password"
            required
            value={form.password_confirmation}
            onChange={set('password_confirmation')}
            placeholder="••••••••"
            className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? 'Resetting…' : 'Reset password'}
        </button>
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <AuthShell>
      <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-slate-100" aria-hidden="true" />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  )
}
