'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import type { ApiError } from '@/lib/api'
import type { Service } from '@/types'
import { fmtDate } from '@/lib/utils'
import StatusBadge from '@/components/StatusBadge'
import ConfirmModal from '@/components/ConfirmModal'

const TERMINAL = new Set(['active', 'failed', 'rejected', 'terminated'])
const POLL_MS = 30_000

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:gap-4">
      <dt className="w-36 flex-shrink-0 text-sm font-medium text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-900">{children}</dd>
    </div>
  )
}

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>()

  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [terminating, setTerminating] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function showToast(type: 'success' | 'error', msg: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ type, msg })
    toastTimer.current = setTimeout(() => setToast(null), 4000)
  }

  function scheduleNextPoll(svc: Service) {
    if (pollTimer.current) clearTimeout(pollTimer.current)
    if (TERMINAL.has(svc.status)) return
    pollTimer.current = setTimeout(() => refetch(), POLL_MS)
  }

  function refetch() {
    api.get<{ service: Service }>(`/api/services/${id}`)
      .then((res) => {
        setService(res.data.service)
        scheduleNextPoll(res.data.service)
      })
      .catch(() => {/* silently stop on background errors */})
  }

  useEffect(() => {
    api.get<{ service: Service }>(`/api/services/${id}`)
      .then((res) => {
        setService(res.data.service)
        scheduleNextPoll(res.data.service)
      })
      .catch((err: ApiError) => {
        setError(err.status === 404 ? 'Service not found.' : 'Failed to load service.')
      })
      .finally(() => setLoading(false))

    function onVisibilityChange() {
      if (document.visibilityState === 'visible') refetch()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      if (pollTimer.current) clearTimeout(pollTimer.current)
      if (toastTimer.current) clearTimeout(toastTimer.current)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleTerminate() {
    setConfirmOpen(false)
    setTerminating(true)
    try {
      await api.delete(`/api/services/${id}`)
      setService((prev) => prev ? { ...prev, status: 'terminated' } : prev)
      showToast('success', 'Service terminated successfully.')
    } catch {
      showToast('error', 'Failed to terminate service. Please try again.')
    } finally {
      setTerminating(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-5 w-full animate-pulse rounded bg-slate-100" aria-hidden="true" />
        ))}
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error ?? 'Service not found.'}
        </div>
        <Link href="/services" className="flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800">
          <ArrowLeft className="h-4 w-4" /> Back to Services
        </Link>
      </div>
    )
  }

  const canTerminate = !['terminated', 'rejected'].includes(service.status)

  return (
    <>
      <ConfirmModal
        open={confirmOpen}
        title="Terminate this service?"
        description={`This will permanently shut down "${service.name}". This action cannot be undone.`}
        confirmLabel="Yes, terminate"
        destructive
        onConfirm={handleTerminate}
        onCancel={() => setConfirmOpen(false)}
      />

      <div className="mx-auto max-w-2xl space-y-6">
        {/* Breadcrumb */}
        <Link
          href="/services"
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4 flex-shrink-0" />
          Back to Services
        </Link>

        {/* Toast */}
        {toast && (
          <div className={`rounded-lg border px-4 py-3 text-sm ${
            toast.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}>
            {toast.msg}
          </div>
        )}

        {/* Provisioning/pending banner */}
        {(service.status === 'pending_approval' || service.status === 'provisioning') && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
            {service.status === 'pending_approval'
              ? 'Your service is under review. We\'ll update this page automatically.'
              : 'Your service is being provisioned. This usually takes a few minutes.'}
          </div>
        )}

        {/* Main card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">{service.name}</h1>
              <p className="mt-0.5 text-sm text-slate-500">{service.domain}</p>
            </div>
            <StatusBadge status={service.status} />
          </div>

          <dl className="space-y-4">
            <DetailRow label="Service ID">
              <span className="font-mono text-xs text-slate-600">{service.id}</span>
            </DetailRow>
            <DetailRow label="Type">
              <span className="capitalize">{service.type}</span>
            </DetailRow>
            <DetailRow label="Domain">{service.domain}</DetailRow>
            <DetailRow label="Status">
              <StatusBadge status={service.status} />
            </DetailRow>

            {service.url && (
              <DetailRow label="Live URL">
                <a
                  href={service.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-brand-700 hover:text-brand-800 hover:underline"
                >
                  {service.url}
                  <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                </a>
              </DetailRow>
            )}

            {(service.failed_reason) && (
              <DetailRow label="Reason">
                <span className="text-red-700">{service.failed_reason}</span>
              </DetailRow>
            )}

            <DetailRow label="Requested">{fmtDate(service.created_at)}</DetailRow>

            {service.provisioned_at && (
              <DetailRow label="Provisioned">{fmtDate(service.provisioned_at)}</DetailRow>
            )}
          </dl>
        </div>

        {/* Actions */}
        {canTerminate && (
          <div className="rounded-xl border border-red-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-800">Danger Zone</h2>
            <p className="mt-1 text-sm text-slate-500">
              Terminating a service is permanent and cannot be undone.
            </p>
            <button
              onClick={() => setConfirmOpen(true)}
              disabled={terminating}
              className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {terminating && <Loader2 className="h-4 w-4 animate-spin" />}
              {terminating ? 'Terminating…' : 'Terminate Service'}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
