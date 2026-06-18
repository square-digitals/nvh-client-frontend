'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import AuthShell from '@/components/AuthShell'
import { api } from '@/lib/api'
import type { ApiError } from '@/lib/api'

interface FieldErrors {
  name?: string
  email?: string
  password?: string
  password_confirmation?: string
}

export default function RegisterPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
      setError(null)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setFieldErrors({})
    setError(null)

    try {
      await api.post('/api/auth/register', form)
      router.replace('/verify-email')
    } catch (err) {
      const e = err as ApiError
      if (e.status === 422 && e.errors) {
        const mapped: FieldErrors = {}
        for (const [k, v] of Object.entries(e.errors)) {
          mapped[k as keyof FieldErrors] = v[0]
        }
        setFieldErrors(mapped)
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = (hasError: boolean) =>
    `block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:ring-2 ${
      hasError
        ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20'
        : 'border-slate-300 focus:border-brand-600 focus:ring-brand-600/20'
    }`

  return (
    <AuthShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-brand-700 hover:text-brand-800">
              Sign in
            </Link>
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
              Full name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={form.name}
              onChange={set('name')}
              placeholder="Alice Johnson"
              className={inputClass(!!fieldErrors.name)}
            />
            {fieldErrors.name && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>
            )}
          </div>

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
              className={inputClass(!!fieldErrors.email)}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={form.password}
              onChange={set('password')}
              placeholder="••••••••"
              className={inputClass(!!fieldErrors.password)}
            />
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="password_confirmation" className="block text-sm font-medium text-slate-700 mb-1.5">
              Confirm password
            </label>
            <input
              id="password_confirmation"
              type="password"
              autoComplete="new-password"
              required
              value={form.password_confirmation}
              onChange={set('password_confirmation')}
              placeholder="••••••••"
              className={inputClass(!!fieldErrors.password_confirmation)}
            />
            {fieldErrors.password_confirmation && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.password_confirmation}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      </div>
    </AuthShell>
  )
}
