import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireCsrfForMutation, handleApiError } from '@/lib/api-utils'
import { z } from 'zod'
import { createSubscription } from '@/services/subscriptionService'

export async function POST(req: Request) {
  try {
    await requireCsrfForMutation(req)
    await requireAdmin()

    const body = await req.json()
    const schema = z.object({
      userId: z.string().min(1),
      planType: z.enum(['BASIC', 'PREMIUM', 'GOLD']),
    })
    const { userId, planType } = schema.parse(body)

    // createSubscription reads plan config from the database,
    // parses the duration, expires old subs, and promotes the user role.
    // Pass amount=0 for admin-granted subscriptions.
    const subscription = await createSubscription(userId, planType, '', 0)

    return NextResponse.json({ subscription })
  } catch (err) {
    if (err instanceof Error && err.message.includes('ZodError')) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    return handleApiError(err)
  }
}

