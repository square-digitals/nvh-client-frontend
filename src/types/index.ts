export interface Client {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  status: 'active' | 'suspended'
  plan: string | null
  email_verified_at: string | null
}

export type ServiceStatus =
  | 'pending_approval'
  | 'provisioning'
  | 'active'
  | 'failed'
  | 'rejected'
  | 'suspended'
  | 'terminated'

export interface Service {
  id: string
  client_id: string
  type: string
  name: string
  domain: string
  status: ServiceStatus
  url: string | null
  failed_reason: string | null
  admin_service_id: string | null
  provisioned_at: string | null
  synced_at: string | null
  created_at: string
  updated_at: string
}

export type InvoiceStatus = 'unpaid' | 'paid' | 'overdue' | 'void'

export interface Invoice {
  id: string
  client_id: string
  external_id: string
  amount: string
  currency: string
  status: InvoiceStatus
  due_date: string
  paid_at: string | null
  period_start: string
  period_end: string
  synced_at: string
  created_at: string
  updated_at: string
}
