'use client'

const CSRF_COOKIE = 'csrf-token'

// No-op: kept for backwards compatibility with useAuth.ts
// The real token is now read directly from the csrf-token cookie set by the server
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function setCsrfToken(_token: string) {}


function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(?:^|; )' + CSRF_COOKIE + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

export async function apiFetch(url: string, options: RequestInit = {}) {
  const csrf = getCsrfToken()
  const headers = new Headers(options.headers)
  if (csrf) headers.set('x-csrf-token', csrf)
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(url, { ...options, headers })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error ?? `Request failed: ${res.status}`)
  }

  return res
}
