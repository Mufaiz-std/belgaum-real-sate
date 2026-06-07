import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getRemainingTokens } from '@/services/tokenService'
import { getActiveSubscription } from '@/services/subscriptionService'
import { z } from 'zod'
import { requireCsrfForMutation, handleApiError } from '@/lib/api-utils'

export async function GET() {
  try {
    const session = await requireAuth()

    const [user, subscription, tokens] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.userId },
        select: {
          id: true,
          phone: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
      getActiveSubscription(session.userId),
      getRemainingTokens(session.userId),
    ])

    return NextResponse.json({ user, subscription, tokensRemaining: tokens })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function PATCH(req: Request) {
  try {
    await requireCsrfForMutation(req)
    const session = await requireAuth()
    const body = await req.json()

    const schema = z.object({
      name: z.string().min(2).max(50).optional(),
      email: z.string().email().optional(),
    })
    const data = schema.parse(body)

    const user = await prisma.user.update({
      where: { id: session.userId },
      data,
      select: { id: true, phone: true, name: true, email: true, role: true },
    })

    return NextResponse.json({ user })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 })
    }
    return handleApiError(err)
  }
}
