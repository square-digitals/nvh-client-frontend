import { Server } from 'lucide-react'

const FEATURES = [
  'Manage your hosting services in one place',
  'View and pay invoices instantly',
  'Real-time service provisioning status',
  'Secure, cookie-based authentication',
]

export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-brand-950 p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600">
            <Server className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-white">New Ventures Hosting</span>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white leading-snug">
              Your hosting,<br />under control.
            </h2>
            <p className="mt-3 text-brand-300 text-sm leading-relaxed">
              The client portal for New Ventures Hosting customers.
            </p>
          </div>
          <ul className="space-y-3">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-brand-300">
                <span className="mt-0.5 h-4 w-4 flex-shrink-0 rounded-full bg-brand-700 flex items-center justify-center">
                  <span className="block h-1.5 w-1.5 rounded-full bg-brand-300" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-brand-700">© {new Date().getFullYear()} New Ventures Hosting</p>
      </div>

      {/* Right — full width on mobile, half on lg */}
      <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 px-6 py-12">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600">
            <Server className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-slate-800">New Ventures Hosting</span>
        </div>

        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
