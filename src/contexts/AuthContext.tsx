'use client'

import { createContext, useContext, useState } from 'react'
import type { Client } from '@/types'
import { api } from '@/lib/api'

interface AuthContextValue {
  client: Client | null
  setClient: (client: Client | null) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<Client | null>(null)

  async function logout() {
    try {
      await api.post('/api/auth/logout')
    } catch {
      // proceed regardless
    }
    setClient(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ client, setClient, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
