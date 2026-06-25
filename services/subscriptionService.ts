import { prisma } from '@/lib/prisma'

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
  _paymentId: string,
  paidAmount?: number
) {
  const planConfig = await prisma.planConfig.findUnique({
    where: { planKey: planType },
  })

  if (!planConfig) {
    throw new Error('Invalid plan type')
  }

  // Parse duration text to a time offset
  // Supports: "15 mins", "2 hours", "7 days", "2 weeks", "3 Months", "1 year", "Lifetime"
  const expiryDate = new Date()
  const durationLower = planConfig.duration.toLowerCase().trim()
  const num = parseInt(durationLower) || 1

  if (durationLower.includes('min')) {
    expiryDate.setMinutes(expiryDate.getMinutes() + num)
  } else if (durationLower.includes('hour')) {
    expiryDate.setHours(expiryDate.getHours() + num)
  } else {
    // For days, weeks, months, years, or lifetime:
    // Set expiry to exactly 11:59:59 PM IST (which is 18:29:59 UTC) of the final day.
    // This perfectly aligns with the midnight (12:00 AM IST) cron job.
    if (durationLower.includes('day')) {
      expiryDate.setDate(expiryDate.getDate() + num)
    } else if (durationLower.includes('week')) {
      expiryDate.setDate(expiryDate.getDate() + num * 7)
    } else if (durationLower.includes('month')) {
      expiryDate.setMonth(expiryDate.getMonth() + num)
    } else if (durationLower.includes('year')) {
      expiryDate.setFullYear(expiryDate.getFullYear() + num)
    } else if (durationLower.includes('life')) {
      expiryDate.setFullYear(expiryDate.getFullYear() + 100)
    } else {
      // Fallback: default to 30 days
      expiryDate.setDate(expiryDate.getDate() + 30)
    }
    
    // Set to 18:29:59.999 UTC (11:59:59 PM IST)
    expiryDate.setUTCHours(18, 29, 59, 999)
  }

  await prisma.subscription.updateMany({
    where: { userId, status: 'ACTIVE' },
    data: { status: 'EXPIRED' },
  })

  const subscription = await prisma.subscription.create({
    data: {
      userId,
      planType: planType,
      amount: paidAmount ?? planConfig.price,
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
