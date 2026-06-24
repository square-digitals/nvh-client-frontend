'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Plus, ChevronRight, RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'
import type { Service, ServiceStatus } from '@/types'
import { fmtDate } from '@/lib/utils'
import StatusBadge from '@/components/StatusBadge'

const TABS: { label: string; value: ServiceStatus | 'all' }[] = [
  { label: 'All',          value: 'all' },
  { label: 'Active',       value: 'active' },
  { label: 'Provisioning', value: 'provisioning' },
  { label: 'Pending',      value: 'pending_approval' },
  { label: 'Suspended',    value: 'suspended' },
  { label: 'Terminated',   value: 'terminated' },
]

function TableRowSkeleton() {
  return (
    <tr>
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 w-full animate-pulse rounded bg-slate-100" aria-hidden="true" />
        </td>
      ))}
    </tr>
  )
}

const POLL_MS = 30_000

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [tab, setTab] = useState<ServiceStatus | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function fetchServices(showLoading = false) {
    if (showLoading) setLoading(true)
    return api.get<{ services: Service[] }>('/api/services')
      .then((res) => setServices(res.data.services))
      .catch(() => { if (showLoading) setError('Failed to load services. Refresh to retry.') })
      .finally(() => { if (showLoading) setLoading(false) })
  }

  async function handleRefresh() {
    setRefreshing(true)
    await fetchServices()
    setRefreshing(false)
  }

  useEffect(() => {
    fetchServices(true)

    pollTimer.current = setInterval(() => fetchServices(), POLL_MS)

    function onVisibilityChange() {
      if (document.visibilityState === 'visible') fetchServices()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = tab === 'all' ? services : services.filter((s) => s.status === tab)

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex rounded-lg border border-slate-200 bg-white p-1">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors capitalize ${
                tab === t.value
                  ? 'bg-brand-700 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            title="Refresh"
            className="flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2.5 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/services/new"
            className="flex items-center gap-2 rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
          >
            <Plus className="h-4 w-4" />
            Request Service
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-medium uppercase tracking-wide text-slate-400">
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Domain</th>
                <th className="px-6 py-3 text-left">Type</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Created</th>
                <th className="px-6 py-3 text-left"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="py-16 text-center">
                      <p className="text-sm text-slate-400">
                        {tab === 'all' ? 'No services yet.' : `No ${tab.replace('_', ' ')} services.`}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-6 py-3 font-medium text-slate-900">{s.name}</td>
                    <td className="px-6 py-3 text-slate-600">{s.domain}</td>
                    <td className="px-6 py-3 text-slate-600 capitalize">{s.type}</td>
                    <td className="px-6 py-3"><StatusBadge status={s.status} /></td>
                    <td className="px-6 py-3 text-slate-500">{fmtDate(s.created_at)}</td>
                    <td className="px-6 py-3 text-right">
                      <Link
                        href={`/services/${s.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:text-brand-800"
                      >
                        View <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
