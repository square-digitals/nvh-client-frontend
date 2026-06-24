'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import type { Client } from '@/types'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':  'Dashboard',
  '/services':   'Services',
  '/services/new': 'New Service',
  '/billing':    'Billing',
}

function resolveTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  if (/^\/services\/.+/.test(pathname)) return 'Service Details'
  if (/^\/billing\/.+/.test(pathname))  return 'Invoice'
  return 'N-panel'
}

export default function PortalShell({ children }: { children: React.ReactNode }) {
  const { setClient } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    api.get<{ client: Client }>('/api/auth/me')
      .then((res) => {
        setClient(res.data.client)
        setReady(true)
      })
      .catch(() => {
        router.replace('/login')
      })
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-700 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar title={resolveTitle(pathname)} />
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          <div className="space-y-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
