'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { api } from '@/lib/api'
import type { Invoice, InvoiceStatus } from '@/types'
import { fmtDate, fmtCurrency } from '@/lib/utils'
import StatusBadge from '@/components/StatusBadge'

const TABS: { label: string; value: InvoiceStatus | 'all' }[] = [
  { label: 'All',     value: 'all' },
  { label: 'Unpaid',  value: 'unpaid' },
  { label: 'Paid',    value: 'paid' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Void',    value: 'void' },
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

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [tab, setTab] = useState<InvoiceStatus | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.get<{ invoices: Invoice[] }>('/api/invoices')
      .then((res) => setInvoices(res.data.invoices))
      .catch(() => setError('Failed to load invoices. Refresh to retry.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = tab === 'all' ? invoices : invoices.filter((i) => i.status === tab)

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Tab filter */}
      <div className="flex rounded-lg border border-slate-200 bg-white p-1 w-fit">
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

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-medium uppercase tracking-wide text-slate-400">
                <th className="px-6 py-3 text-left">Invoice</th>
                <th className="px-6 py-3 text-left">Amount</th>
                <th className="px-6 py-3 text-left">Period</th>
                <th className="px-6 py-3 text-left">Due Date</th>
                <th className="px-6 py-3 text-left">Status</th>
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
                        {tab === 'all' ? 'No invoices yet.' : `No ${tab} invoices.`}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => (
                  <tr key={inv.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-6 py-3 font-mono text-xs text-slate-700">{inv.id}</td>
                    <td className="px-6 py-3 font-medium text-slate-900">
                      {fmtCurrency(inv.amount, inv.currency)}
                    </td>
                    <td className="px-6 py-3 text-slate-600">
                      {fmtDate(inv.period_start)} – {fmtDate(inv.period_end)}
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
  )
}
