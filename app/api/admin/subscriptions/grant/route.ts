import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireCsrfForMutation, handleApiError } from '@/lib/api-utils'
import { z } from 'zod'

const PLAN_DETAILS: Record<string, { durationDays: number; price: number; dailyLimit: number }> = {
  BASIC: { durationDays: 90, price: 3000, dailyLimit: 15 },
  PREMIUM: { durationDays: 180, price: 4000, dailyLimit: 15 },
  GOLD: { durationDays: 365, price: 6000, dailyLimit: 15 },
}

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

    const plan = PLAN_DETAILS[planType]
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + plan.durationDays)

    // Expire any existing active subscriptions
    await prisma.subscription.updateMany({
      where: { userId, status: 'ACTIVE' },
      data: { status: 'EXPIRED' },
    })

    // Create the new subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        planType,
        amount: 0, // Admin-granted; no payment
        expiryDate,
        status: 'ACTIVE',
        dailyLimit: plan.dailyLimit,
      },
    })

    // Promote the user role
    await prisma.user.update({
      where: { id: userId },
      data: { role: 'SUBSCRIBER' },
    })

    return NextResponse.json({ subscription })
  } catch (err) {
    if (err instanceof Error && err.message.includes('ZodError')) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    return handleApiError(err)
  }
}
