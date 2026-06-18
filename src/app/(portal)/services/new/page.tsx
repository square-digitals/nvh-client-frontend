'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, ArrowLeft } from 'lucide-react'
import { api } from '@/lib/api'
import type { ApiError } from '@/lib/api'
import type { Service } from '@/types'

interface FieldErrors {
  name?: string
  domain?: string
  type?: string
}

const SERVICE_TYPES = [
  { value: 'wordpress', label: 'WordPress' },
]

export default function NewServicePage() {
  const router = useRouter()

  const [form, setForm] = useState({ name: '', domain: '', type: 'wordpress' })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      const res = await api.post<{ service: Service }>('/api/services', form)
      router.replace(`/services/${res.data.service.id}`)
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
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link
          href="/services"
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4 flex-shrink-0" />
          Back to Services
        </Link>
        <h1 className="mt-4 text-xl font-semibold text-slate-900">Request a New Service</h1>
        <p className="mt-1 text-sm text-slate-500">
          Submit your hosting request for admin review. You&apos;ll be notified once it&apos;s approved and provisioned.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
              Service name
            </label>
            <input
              id="name"
              type="text"
              required
              value={form.name}
              onChange={set('name')}
              placeholder="My Blog"
              className={inputClass(!!fieldErrors.name)}
            />
            {fieldErrors.name && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="domain" className="block text-sm font-medium text-slate-700 mb-1.5">
              Domain
            </label>
            <input
              id="domain"
              type="text"
              required
              value={form.domain}
              onChange={set('domain')}
              placeholder="myblog.com"
              className={inputClass(!!fieldErrors.domain)}
            />
            {fieldErrors.domain && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.domain}</p>
            )}
            <p className="mt-1 text-xs text-slate-400">
              Must be a real public domain — no localhost or private addresses.
            </p>
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-slate-700 mb-1.5">
              Service type
            </label>
            <select
              id="type"
              value={form.type}
              onChange={set('type')}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 w-full text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {SERVICE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            {fieldErrors.type && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.type}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <Link
              href="/services"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? 'Submitting…' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
