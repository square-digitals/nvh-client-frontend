'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Loader2 } from 'lucide-react'
import AuthShell from '@/components/AuthShell'
import { api } from '@/lib/api'
import type { ApiError } from '@/lib/api'

type Status = 'idle' | 'sending' | 'sent' | 'verified' | 'rate-limited' | 'error'

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<Status>('idle')

  async function handleResend() {
    setStatus('sending')
    try {
      await api.post('/api/auth/email/resend')
      setStatus('sent')
    } catch (err) {
      const e = err as ApiError
      if (e.status === 422) {
        setStatus('verified')
      } else if (e.status === 429) {
        setStatus('rate-limited')
      } else {
        setStatus('error')
      }
    }
  }

  return (
    <AuthShell>
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100">
            <Mail className="h-6 w-6 text-brand-600" />
          </div>
        </div>

        <div>
          <h1 className="text-xl font-semibold text-slate-900">Check your inbox</h1>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            We&apos;ve sent a verification link to your email address. Click the link to activate
            your account before you can access the portal.
          </p>
        </div>

        {status === 'idle' && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Didn&apos;t receive the email? Check your spam folder.
          </div>
        )}

        {status === 'sent' && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            Verification link sent — check your inbox.
          </div>
        )}

        {status === 'verified' && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            Your email is already verified.{' '}
            <Link href="/login" className="font-medium underline">
              Sign in
            </Link>
          </div>
        )}

        {status === 'rate-limited' && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Too many requests. Please wait a minute before trying again.
          </div>
        )}

        {status === 'error' && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Something went wrong. Please try again.
          </div>
        )}

        {status !== 'verified' && (
          <button
            onClick={handleResend}
            disabled={status === 'sending' || status === 'sent' || status === 'rate-limited'}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'sending' && <Loader2 className="h-4 w-4 animate-spin" />}
            {status === 'sending' ? 'Sending…' : 'Resend verification email'}
          </button>
        )}

        <p className="text-sm text-slate-500">
          Already verified?{' '}
          <Link href="/login" className="font-medium text-brand-700 hover:text-brand-800">
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
