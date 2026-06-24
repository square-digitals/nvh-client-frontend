import { AuthProvider } from '@/contexts/AuthContext'
import PortalShell from '@/components/PortalShell'

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PortalShell>{children}</PortalShell>
    </AuthProvider>
  )
}
