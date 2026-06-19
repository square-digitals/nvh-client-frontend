import Link from 'next/link'
import { Mail } from 'lucide-react'
import AuthShell from '@/components/AuthShell'

export default function VerifyEmailPage() {
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

        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Didn&apos;t receive the email? Check your spam folder.
        </div>

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
