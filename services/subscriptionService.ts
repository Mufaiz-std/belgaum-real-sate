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
  planType: string,
  _paymentId: string
) {
  const planConfig = await prisma.planConfig.findUnique({
    where: { planKey: planType },
  })

  if (!planConfig) {
    throw new Error('Invalid plan type')
  }

  // Parse duration text to days (e.g. "3 Months" -> ~90 days)
  let durationDays = 30
  const durationLower = planConfig.duration.toLowerCase()
  if (durationLower.includes('month')) {
    const num = parseInt(durationLower) || 1
    durationDays = num * 30
  } else if (durationLower.includes('year')) {
    const num = parseInt(durationLower) || 1
    durationDays = num * 365
  }

  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + durationDays)

  await prisma.subscription.updateMany({
    where: { userId, status: 'ACTIVE' },
    data: { status: 'EXPIRED' },
  })

  const subscription = await prisma.subscription.create({
    data: {
      userId,
      planType: planType as PlanType,
      amount: planConfig.price,
      expiryDate,
      status: 'ACTIVE',
      dailyLimit: planConfig.dailyLimit,
    },
  })

  await prisma.user.update({
    where: { id: userId },
    data: { role: 'SUBSCRIBER' },
  })

  return subscription
}
