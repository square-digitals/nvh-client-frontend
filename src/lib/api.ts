'use client'

import axios, { AxiosError, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios'
import { csrfStore } from './csrfStore'

export interface ApiError {
  status: number
  message: string
  errors?: Record<string, string[]>
}

function extractCsrf(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null
  const match = cookieHeader.match(/XSRF-TOKEN=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

// Inject CSRF token from in-memory store on mutating requests
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const method = (config.method ?? '').toUpperCase()
  const mutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
  if (mutating) {
    const token = csrfStore.get()
    if (token) {
      config.headers['X-XSRF-TOKEN'] = token
    }
  }
  return config
})

// Read XSRF-TOKEN from response cookies and persist to store
api.interceptors.response.use(
  (response: AxiosResponse) => {
    const setCookie = response.headers['set-cookie']
    if (Array.isArray(setCookie)) {
      for (const c of setCookie) {
        const t = extractCsrf(c)
        if (t) { csrfStore.set(t); break }
      }
    }
    return response
  },
  (error: AxiosError) => {
    const status = error.response?.status
    const data = error.response?.data as { message?: string; errors?: Record<string, string[]> }

    if (status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }

    if (status === 403) {
      const msg = data?.message ?? ''
      if (typeof window !== 'undefined') {
        if (msg.toLowerCase().includes('verified')) {
          window.location.href = '/verify-email'
        }
      }
    }

    const apiError: ApiError = {
      status: status ?? 0,
      message: data?.message ?? 'Something went wrong. Please try again.',
      errors: data?.errors,
    }

    return Promise.reject(apiError)
  }
)
