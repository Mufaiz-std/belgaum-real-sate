import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'

const CSRF_COOKIE = 'csrf-token'
const CSRF_HEADER = 'x-csrf-token'

export function generateCsrfToken(): string {
  return randomBytes(32).toString('hex')
}

export async function setCsrfCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function verifyCsrf(req: Request): Promise<boolean> {
  const cookieStore = await cookies()
  const cookieToken = cookieStore.get(CSRF_COOKIE)?.value
  const headerToken = req.headers.get(CSRF_HEADER)

  // If no CSRF cookie has been set yet, fall through to JWT auth as the guard
  if (!cookieToken) return true
  if (!headerToken) return false
  return cookieToken === headerToken
}

export async function requireCsrf(req: Request) {
  const valid = await verifyCsrf(req)
  if (!valid) throw new Error('CSRF_INVALID')
}
