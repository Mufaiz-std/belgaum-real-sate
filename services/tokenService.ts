import { prisma } from '@/lib/prisma'

function todayDate(): Date {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  return today
}

export async function getRemainingTokens(userId: string): Promise<number> {
  const subscription = await prisma.subscription.findFirst({
    where: { userId, status: 'ACTIVE', expiryDate: { gt: new Date() } },
  })
  if (!subscription) return 0

  const usage = await prisma.dailyUsage.findUnique({
    where: { userId_date: { userId, date: todayDate() } },
  })

  const used = usage?.viewsUsed ?? 0
  return Math.max(0, subscription.dailyLimit - used)
}

export async function getTokensUsedToday(userId: string): Promise<number> {
  const usage = await prisma.dailyUsage.findUnique({
    where: { userId_date: { userId, date: todayDate() } },
  })
  return usage?.viewsUsed ?? 0
}

export async function consumeToken(
  userId: string
): Promise<{ success: boolean; remaining: number }> {
  const remaining = await getRemainingTokens(userId)
  if (remaining <= 0) return { success: false, remaining: 0 }

  await prisma.dailyUsage.upsert({
    where: { userId_date: { userId, date: todayDate() } },
    create: { userId, date: todayDate(), viewsUsed: 1 },
    update: { viewsUsed: { increment: 1 } },
  })

  return { success: true, remaining: remaining - 1 }
}

export async function resetDailyUsage() {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setUTCHours(0, 0, 0, 0)

  await prisma.dailyUsage.deleteMany({
    where: { date: { lt: yesterday } },
  })
}
