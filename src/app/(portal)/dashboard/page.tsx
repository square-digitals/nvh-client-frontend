'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Layers, Receipt, ChevronRight } from 'lucide-react'
import { api } from '@/lib/api'
import type { Service, Invoice } from '@/types'
import { fmtDate, fmtCurrency } from '@/lib/utils'
import StatusBadge from '@/components/StatusBadge'

interface Stats {
  total: number
  active: number
  unpaid: number
  overdue: number
}

// ── Skeletons ──────────────────────────────────────────────────────────────

function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
      <div className="h-3.5 w-24 animate-pulse rounded bg-slate-100" aria-hidden="true" />
      <div className="h-8 w-16 animate-pulse rounded bg-slate-100" aria-hidden="true" />
    </div>
  )
}

function TableRowSkeleton({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 w-full animate-pulse rounded bg-slate-100" aria-hidden="true" />
        </td>
      ))}
    </tr>
  )
}

// ── Stat card ──────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  href,
}: {
  label: string
  value: number
  icon: React.ElementType
  href: string
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md block"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50">
          <Icon className="h-4 w-4 text-brand-600" />
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
    </Link>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [services, setServices] = useState<Service[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      api.get<{ services: Service[] }>('/api/services'),
      api.get<{ invoices: Invoice[] }>('/api/invoices'),
    ])
      .then(([svcRes, invRes]) => {
        const svcs = svcRes.data.services
        const invs = invRes.data.invoices
        setServices(svcs)
        setInvoices(invs)
        setStats({
          total:   svcs.length,
          active:  svcs.filter((s) => s.status === 'active').length,
          unpaid:  invs.filter((i) => i.status === 'unpaid').length,
          overdue: invs.filter((i) => i.status === 'overdue').length,
        })
      })
      .catch(() => setError('Failed to load dashboard data. Refresh to retry.'))
      .finally(() => setLoading(false))
  }, [])

  const recentServices = services.slice(0, 5)
  const recentInvoices = invoices.slice(0, 5)

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Total Services"   value={stats!.total}   icon={Layers}  href="/services" />
            <StatCard label="Active Services"  value={stats!.active}  icon={Layers}  href="/services" />
            <StatCard label="Unpaid Invoices"  value={stats!.unpaid}  icon={Receipt} href="/billing" />
            <StatCard label="Overdue Invoices" value={stats!.overdue} icon={Receipt} href="/billing" />
          </>
        )}
      </div>

      {/* Recent Services */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800">Recent Services</h2>
          <Link
            href="/services"
            className="flex items-center gap-0.5 text-sm font-medium text-brand-700 hover:text-brand-800"
          >
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
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
                  Array.from({ length: 3 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
                ) : recentServices.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="py-16 text-center">
                        <p className="text-sm text-slate-400">No services yet.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentServices.map((s) => (
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

      {/* Recent Invoices */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800">Recent Invoices</h2>
          <Link
            href="/billing"
            className="flex items-center gap-0.5 text-sm font-medium text-brand-700 hover:text-brand-800"
          >
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-medium uppercase tracking-wide text-slate-400">
                  <th className="px-6 py-3 text-left">Invoice</th>
                  <th className="px-6 py-3 text-left">Amount</th>
                  <th className="px-6 py-3 text-left">Due Date</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)
                ) : recentInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="py-16 text-center">
                        <p className="text-sm text-slate-400">No invoices yet.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentInvoices.map((inv) => (
                    <tr key={inv.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-6 py-3 font-mono text-xs text-slate-700">{inv.external_id}</td>
                      <td className="px-6 py-3 font-medium text-slate-900">
                        {fmtCurrency(inv.amount, inv.currency)}
                      </td>
                      <td className="px-6 py-3 text-slate-600">{fmtDate(inv.due_date)}</td>
                      <td className="px-6 py-3"><StatusBadge status={inv.status} /></td>
                      <td className="px-6 py-3 text-right">
                        <Link
                          href={`/billing/${inv.id}`}
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
    </div>
  )
}
