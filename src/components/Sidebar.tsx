'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Server, LayoutDashboard, Layers, Receipt } from 'lucide-react'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/services',  label: 'Services',  icon: Layers },
  { href: '/billing',   label: 'Billing',   icon: Receipt },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-60 flex-shrink-0 flex-col bg-brand-950">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-600">
          <Server className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-semibold text-white leading-tight">
          New Ventures<br />Hosting
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-brand-800 text-white'
                  : 'text-brand-300 hover:bg-brand-900 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-brand-900">
        <p className="text-xs text-brand-600">© New Ventures Hosting</p>
      </div>
    </aside>
  )
}
