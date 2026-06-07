import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export interface SessionUser {
  userId: string
  role: 'GUEST' | 'USER' | 'SUBSCRIBER' | 'ADMIN'
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as SessionUser
  } catch {
    return null
  }
}

export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession()
  if (!session) throw new Error('UNAUTHORIZED')
  return session
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') throw new Error('FORBIDDEN')
  return session
}

export async function getAccessLevel(
  userId: string | null,
  propertyId: string
): Promise<'GUEST' | 'REGISTERED' | 'UNLOCKED' | 'SUBSCRIBER'> {
  if (!userId) return 'GUEST'

  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: 'ACTIVE',
      expiryDate: { gt: new Date() },
    },
  })
  if (subscription) return 'SUBSCRIBER'

  const unlock = await prisma.propertyUnlock.findFirst({
    where: { userId, propertyId },
  })
  if (unlock) return 'UNLOCKED'

  return 'REGISTERED'
}
