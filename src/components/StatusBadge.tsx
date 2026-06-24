import type { ServiceStatus, InvoiceStatus } from '@/types'

type Status = ServiceStatus | InvoiceStatus

const MAP: Record<Status, { label: string; classes: string }> = {
  // service statuses
  pending_approval: { label: 'Under Review',  classes: 'bg-blue-50 text-blue-700' },
  provisioning:     { label: 'Setting Up',    classes: 'bg-blue-50 text-blue-700' },
  active:           { label: 'Active',         classes: 'bg-green-50 text-green-700' },
  failed:           { label: 'Failed',         classes: 'bg-red-50 text-red-700' },
  rejected:         { label: 'Rejected',       classes: 'bg-red-50 text-red-700' },
  suspended:        { label: 'Suspended',      classes: 'bg-yellow-50 text-yellow-700' },
  terminated:       { label: 'Terminated',     classes: 'bg-slate-100 text-slate-500' },
  // invoice statuses
  unpaid:           { label: 'Unpaid',         classes: 'bg-yellow-50 text-yellow-700' },
  paid:             { label: 'Paid',           classes: 'bg-green-50 text-green-700' },
  overdue:          { label: 'Overdue',        classes: 'bg-red-50 text-red-700' },
  void:             { label: 'Void',           classes: 'bg-slate-100 text-slate-500' },
}

export default function StatusBadge({ status }: { status: Status }) {
  const { label, classes } = MAP[status] ?? { label: status, classes: 'bg-slate-100 text-slate-500' }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${classes}`}>
      {label}
    </span>
  )
}
