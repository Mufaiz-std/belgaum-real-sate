import { prisma } from '@/lib/prisma'
import { DAILY_TOKEN_LIMIT } from '@/lib/constants'
import { getTokensUsedToday } from '@/services/tokenService'

export async function getDashboardUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscriptions: {
        where: { status: 'ACTIVE', expiryDate: { gt: new Date() } },
        orderBy: { expiryDate: 'desc' },
        take: 1,
      },
    },
  })
}

export async function getTokenUsageToday(userId: string) {
  return getTokensUsedToday(userId)
}

export async function getDashboardStats(userId: string) {
  const [activeListings, totalViews, tokenCount, subscription] = await Promise.all([
    prisma.property.count({
      where: { ownerId: userId, status: 'ACTIVE' },
    }),
    prisma.property.aggregate({
      where: { ownerId: userId },
      _sum: { viewCount: true },
    }),
    getTokensUsedToday(userId),
    prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE', expiryDate: { gt: new Date() } },
      orderBy: { expiryDate: 'desc' },
    }),
  ])

  return {
    activeListings,
    totalViews: totalViews._sum.viewCount ?? 0,
    tokensToday: tokenCount,
    tokenLimit: subscription?.dailyLimit ?? DAILY_TOKEN_LIMIT,
    subscription,
    isSubscriber: !!subscription,
  }
}

export async function getUserProperties(
  userId: string,
  options?: {
    status?: string
    search?: string
    page?: number
    limit?: number
  }
) {
  const page = options?.page ?? 1
  const limit = options?.limit ?? 10
  const skip = (page - 1) * limit

  const where: {
    ownerId: string
    status?: 'ACTIVE' | 'PENDING' | 'SOLD' | 'REJECTED' | 'EXPIRED'
    title?: { contains: string; mode: 'insensitive' }
  } = { ownerId: userId }

  if (options?.status && options.status !== 'ALL') {
    where.status = options.status as 'ACTIVE' | 'PENDING' | 'SOLD' | 'REJECTED' | 'EXPIRED'
  }

  if (options?.search) {
    where.title = { contains: options.search, mode: 'insensitive' }
  }

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.property.count({ where }),
  ])

  return { properties, total, page, limit, totalPages: Math.ceil(total / limit) }
}
