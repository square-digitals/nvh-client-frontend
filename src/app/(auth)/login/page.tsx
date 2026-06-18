'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import AuthShell from '@/components/AuthShell'
import { api } from '@/lib/api'
import type { ApiError } from '@/lib/api'
import type { Client } from '@/types'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const wasReset = searchParams.get('reset') === '1'

  const [form, setForm] = useState({ email: '', password: '' })
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
      const res = await api.post<{ client: Client }>('/api/auth/login', form)
      const client = res.data.client
      if (!client.email_verified_at) {
        router.replace('/verify-email')
      } else {
        router.replace('/dashboard')
      }
    } catch (err) {
      const e = err as ApiError
      if (e.status === 422) {
        setError(e.message)
      } else if (e.status === 403) {
        setError('Your account has been suspended. Please contact support.')
      } else if (e.status === 429) {
        setError('Too many attempts. Please wait a minute and try again.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Sign in to your account</h1>
        <p className="mt-1 text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-brand-700 hover:text-brand-800">
            Register
          </Link>
        </p>
      </div>

      {wasReset && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Password reset successfully. Sign in with your new password.
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

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
            value={form.email}
            onChange={set('email')}
            placeholder="you@example.com"
            className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={form.password}
            onChange={set('password')}
            placeholder="••••••••"
            className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
          />
          <div className="mt-2 text-right">
            <Link href="/forgot-password" className="text-sm text-brand-700 hover:text-brand-800">
              Forgot password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <AuthShell>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-slate-100" aria-hidden="true" />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  )
}
