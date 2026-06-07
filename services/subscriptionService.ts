import { prisma } from '@/lib/prisma'
import { PlanType } from '@prisma/client'

export async function getActiveSubscription(userId: string) {
  return prisma.subscription.findFirst({
    where: {
      userId,
      status: 'ACTIVE',
      expiryDate: { gt: new Date() },
    },
  })
}

export async function createSubscription(
  userId: string,
  planType: 'BASIC' | 'PREMIUM' | 'GOLD',
  _paymentId: string
) {
  const durations: Record<string, number> = {
    BASIC: 90,
    PREMIUM: 180,
    GOLD: 365,
  }
  const amounts: Record<string, number> = {
    BASIC: 3000,
    PREMIUM: 4000,
    GOLD: 6000,
  }

  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + durations[planType])

  await prisma.subscription.updateMany({
    where: { userId, status: 'ACTIVE' },
    data: { status: 'EXPIRED' },
  })

  const subscription = await prisma.subscription.create({
    data: {
      userId,
      planType: planType as PlanType,
      amount: amounts[planType],
      expiryDate,
      status: 'ACTIVE',
      dailyLimit: 15,
    },
  })

  await prisma.user.update({
    where: { id: userId },
    data: { role: 'SUBSCRIBER' },
  })

  return subscription
}
