import axios from 'axios'
import type { AxiosError } from 'axios'

export interface ApiError {
  status: number
  message: string
  errors?: Record<string, string[]>
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status
    const data = error.response?.data as { message?: string; errors?: Record<string, string[]> }

    if (status === 401 && typeof window !== 'undefined') {
      window.location.href = '/login'
    }

    if (status === 403 && typeof window !== 'undefined') {
      const msg = data?.message ?? ''
      if (msg.toLowerCase().includes('verified')) {
        window.location.href = '/verify-email'
      }
    }

    return Promise.reject({
      status: status ?? 0,
      message: data?.message ?? 'Something went wrong. Please try again.',
      errors: data?.errors,
    } satisfies ApiError)
  }
)
