'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { api } from '@/lib/api'
import type { ApiError } from '@/lib/api'
import type { Invoice } from '@/types'
import { fmtDate, fmtCurrency } from '@/lib/utils'
import StatusBadge from '@/components/StatusBadge'

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:gap-4">
      <dt className="w-36 flex-shrink-0 text-sm font-medium text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-900">{children}</dd>
    </div>
  )
}

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()

  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.get<{ invoice: Invoice }>(`/api/invoices/${id}`)
      .then((res) => setInvoice(res.data.invoice))
      .catch((err: ApiError) => {
        setError(err.status === 404 ? 'Invoice not found.' : 'Failed to load invoice.')
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-5 w-full animate-pulse rounded bg-slate-100" aria-hidden="true" />
        ))}
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error ?? 'Invoice not found.'}
        </div>
        <Link href="/billing" className="flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800">
          <ArrowLeft className="h-4 w-4" /> Back to Billing
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/billing"
        className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4 flex-shrink-0" />
        Back to Billing
      </Link>

      {/* Header card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              {fmtCurrency(invoice.amount, invoice.currency)}
            </h1>
            <p className="mt-0.5 font-mono text-xs text-slate-500">{invoice.external_id}</p>
          </div>
          <StatusBadge status={invoice.status} />
        </div>

        <dl className="space-y-4">
          <DetailRow label="Invoice ID">
            <span className="font-mono text-xs text-slate-600">{invoice.id}</span>
          </DetailRow>
          <DetailRow label="Amount">
            <span className="font-semibold">{fmtCurrency(invoice.amount, invoice.currency)}</span>
          </DetailRow>
          <DetailRow label="Currency">{invoice.currency}</DetailRow>
          <DetailRow label="Status">
            <StatusBadge status={invoice.status} />
          </DetailRow>
          <DetailRow label="Period">
            {fmtDate(invoice.period_start)} – {fmtDate(invoice.period_end)}
          </DetailRow>
          <DetailRow label="Due Date">
            <span className={invoice.status === 'overdue' ? 'text-red-700 font-medium' : ''}>
              {fmtDate(invoice.due_date)}
            </span>
          </DetailRow>
          {invoice.paid_at && (
            <DetailRow label="Paid On">{fmtDate(invoice.paid_at)}</DetailRow>
          )}
          <DetailRow label="Issued">{fmtDate(invoice.created_at)}</DetailRow>
          <DetailRow label="Last Synced">{fmtDate(invoice.synced_at)}</DetailRow>
        </dl>
      </div>

      {/* Overdue warning */}
      {invoice.status === 'overdue' && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          This invoice is overdue. Please contact support to arrange payment.
        </div>
      )}

      {/* Unpaid notice */}
      {invoice.status === 'unpaid' && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Payment is due by {fmtDate(invoice.due_date)}. Please contact support to make a payment.
        </div>
      )}
    </div>
  )
}
