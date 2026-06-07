import { adminAuth } from '@/lib/firebase-admin'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { SignJWT } from 'jose'
import { generateCsrfToken, setCsrfCookie } from '@/lib/csrf'
import { otpLimiter } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/api-utils'

export async function POST(req: Request) {
  try {
    const ip = await getClientIp()
    try {
      otpLimiter.check(ip)
    } catch {
      return Response.json({ error: 'Too many OTP attempts' }, { status: 429 })
    }

    const { idToken, name } = await req.json()
    if (!idToken) {
      return Response.json({ error: 'Missing idToken' }, { status: 400 })
    }

    const decoded = await adminAuth.verifyIdToken(idToken)
    if (!decoded.phone_number) {
      return Response.json({ error: 'Phone number not found in token' }, { status: 400 })
    }

    const trimmedName =
      typeof name === 'string' && name.trim().length >= 2 ? name.trim() : undefined

    const existing = await prisma.user.findUnique({
      where: { phone: decoded.phone_number },
    })

    if (existing?.status === 'BANNED') {
      return Response.json({ error: 'Account suspended' }, { status: 403 })
    }

    if (!existing && !trimmedName) {
      return Response.json(
        { error: 'Name is required for new accounts', code: 'NAME_REQUIRED' },
        { status: 400 }
      )
    }

    const user = await prisma.user.upsert({
      where: { phone: decoded.phone_number },
      update: {
        updatedAt: new Date(),
        ...(trimmedName && !existing?.name ? { name: trimmedName } : {}),
      },
      create: {
        phone: decoded.phone_number,
        name: trimmedName ?? null,
        role: 'USER',
        status: 'ACTIVE',
      },
    })

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const token = await new SignJWT({ userId: user.id, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secret)

    const cookieStore = await cookies()
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    const csrfToken = generateCsrfToken()
    await setCsrfCookie(csrfToken)

    return Response.json({ success: true, role: user.role, csrfToken })
  } catch (error) {
    console.error('Session creation failed:', error)
    return Response.json({ error: 'Authentication failed' }, { status: 401 })
  }
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
  return Response.json({ success: true })
}
