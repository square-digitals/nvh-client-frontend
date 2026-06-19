'use client'

import { LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface TopbarProps {
  title: string
}

export default function Topbar({ title }: TopbarProps) {
  const { client, logout } = useAuth()

  const initials = client?.name
    ? client.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <h1 className="text-xl font-semibold text-slate-900">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Avatar + name */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-700 text-xs font-semibold text-white">
            {initials}
          </div>
          <span className="text-sm font-medium text-slate-700">
            {client?.name ?? '…'}
          </span>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          aria-label="Log out"
          className="inline-flex items-center gap-1 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
