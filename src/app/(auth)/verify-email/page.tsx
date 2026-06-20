'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import AuthShell from '@/components/AuthShell'
import { api } from '@/lib/api'
import type { ApiError } from '@/lib/api'

type PageStatus = 'checking' | 'inbox' | 'verifying' | 'expired' | 'invalid' | 'error'
type ResendStatus = 'idle' | 'sending' | 'sent' | 'already-verified' | 'rate-limited' | 'error'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [pageStatus, setPageStatus] = useState<PageStatus>('checking')
  const [resendStatus, setResendStatus] = useState<ResendStatus>('idle')

  useEffect(() => {
    const id = searchParams.get('id')
    const hash = searchParams.get('hash')
    const expires = searchParams.get('expires')
    const signature = searchParams.get('signature')

    if (!id || !hash || !expires || !signature) {
      setPageStatus('inbox')
      return
    }

    setPageStatus('verifying')

    api
      .get(`/api/auth/email/verify/${id}/${hash}`, { params: { expires, signature } })
      .then(() => {
        router.replace('/dashboard')
      })
      .catch((err: ApiError) => {
        if (err.status === 410) {
          setPageStatus('expired')
        } else if (err.status === 422) {
          if (err.message?.toLowerCase().includes('already verified')) {
            router.replace('/dashboard')
          } else {
            setPageStatus('invalid')
          }
        } else {
          setPageStatus('error')
        }
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleResend() {
    setResendStatus('sending')
    try {
      await api.post('/api/auth/email/resend')
      setResendStatus('sent')
    } catch (err) {
      const e = err as ApiError
      if (e.status === 422) {
        setResendStatus('already-verified')
      } else if (e.status === 429) {
        setResendStatus('rate-limited')
      } else {
        setResendStatus('error')
      }
    }
  }

  if (pageStatus === 'checking') {
    return (
      <AuthShell>
        <div className="flex flex-col items-center gap-4 py-4">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          <p className="text-sm text-slate-500">Verifying…</p>
        </div>
      </AuthShell>
    )
  }

  if (pageStatus === 'verifying') {
    return (
      <AuthShell>
        <div className="flex flex-col items-center gap-4 py-4">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          <p className="text-sm text-slate-500">Verifying your email address…</p>
        </div>
      </AuthShell>
    )
  }

  if (pageStatus === 'invalid') {
    return (
      <AuthShell>
        <div className="space-y-6 text-center">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Invalid link</h1>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              This verification link is not valid. It may have been tampered with or already used.
            </p>
          </div>
          <p className="text-sm text-slate-500">
            <Link href="/login" className="font-medium text-brand-700 hover:text-brand-800">
              Back to sign in
            </Link>
          </p>
        </div>
      </AuthShell>
    )
  }

  if (pageStatus === 'error') {
    return (
      <AuthShell>
        <div className="space-y-6 text-center">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Something went wrong</h1>
            <p className="mt-2 text-sm text-slate-500">Please try again or request a new link.</p>
          </div>
          <p className="text-sm text-slate-500">
            <Link href="/login" className="font-medium text-brand-700 hover:text-brand-800">
              Back to sign in
            </Link>
          </p>
        </div>
      </AuthShell>
    )
  }

  // 'inbox' and 'expired' both show the resend UI — expired just has a different heading
  const isExpired = pageStatus === 'expired'

  return (
    <AuthShell>
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${isExpired ? 'bg-amber-100' : 'bg-brand-100'}`}>
            {isExpired
              ? <AlertCircle className="h-6 w-6 text-amber-600" />
              : <Mail className="h-6 w-6 text-brand-600" />
            }
          </div>
        </div>

        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            {isExpired ? 'Link expired' : 'Check your inbox'}
          </h1>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            {isExpired
              ? 'Your verification link has expired. Request a new one below.'
              : "We've sent a verification link to your email address. Click the link to activate your account."}
          </p>
        </div>

        {resendStatus === 'idle' && !isExpired && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Didn&apos;t receive the email? Check your spam folder.
          </div>
        )}

        {resendStatus === 'sent' && (
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Verification link sent — check your inbox.
          </div>
        )}

        {resendStatus === 'already-verified' && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            Your email is already verified.{' '}
            <Link href="/login" className="font-medium underline">
              Sign in
            </Link>
          </div>
        )}

        {resendStatus === 'rate-limited' && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Too many requests. Please wait a minute before trying again.
          </div>
        )}

        {resendStatus === 'error' && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Something went wrong. Please try again.
          </div>
        )}

        {resendStatus !== 'already-verified' && (
          <button
            onClick={handleResend}
            disabled={resendStatus === 'sending' || resendStatus === 'sent' || resendStatus === 'rate-limited'}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resendStatus === 'sending' && <Loader2 className="h-4 w-4 animate-spin" />}
            {resendStatus === 'sending' ? 'Sending…' : 'Resend verification email'}
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

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  )
}
