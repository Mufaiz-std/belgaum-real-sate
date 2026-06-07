import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { requireCsrf } from '@/lib/csrf'

export async function getClientIp(): Promise<string> {
  return (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous'
}

export function apiError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function handleApiError(err: unknown) {
  if (err instanceof Error) {
    if (err.message === 'UNAUTHORIZED') return apiError('Unauthorized', 401)
    if (err.message === 'FORBIDDEN') return apiError('Forbidden', 403)
    if (err.message === 'CSRF_INVALID') return apiError('Invalid CSRF token', 403)
    if (err.message === 'RATE_LIMIT_EXCEEDED') return apiError('Too many requests', 429)
  }
  console.error('API error:', err)
  return apiError('Internal error', 500)
}

export async function requireCsrfForMutation(req: Request) {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    await requireCsrf(req)
  }
}
