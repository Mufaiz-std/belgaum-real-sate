import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { consumeToken } from '@/services/tokenService'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'
import { requireCsrfForMutation, handleApiError } from '@/lib/api-utils'

export async function POST(req: Request) {
  try {
    await requireCsrfForMutation(req)
    const session = await requireAuth()

    const sub = await prisma.subscription.findFirst({
      where: {
        userId: session.userId,
        status: 'ACTIVE',
        expiryDate: { gt: new Date() },
      },
    })
    if (!sub) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 403 })
    }

    const result = await consumeToken(session.userId)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Daily limit reached', remaining: 0 },
        { status: 429 }
      )
    }

    await createAuditLog({
      userId: session.userId,
      action: 'TOKEN_CONSUMED',
    })

    return NextResponse.json({ success: true, remaining: result.remaining })
  } catch (err) {
    return handleApiError(err)
  }
}
