'use client'

const CSRF_KEY = 'csrf-token'

export function setCsrfToken(token: string) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(CSRF_KEY, token)
  }
}

export function getCsrfToken(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(CSRF_KEY)
}

export async function apiFetch(url: string, options: RequestInit = {}) {
  const csrf = getCsrfToken()
  const headers = new Headers(options.headers)
  if (csrf) headers.set('x-csrf-token', csrf)
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  return fetch(url, { ...options, headers })
}
