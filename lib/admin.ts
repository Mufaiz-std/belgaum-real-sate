import { prisma } from '@/lib/prisma'

export async function getAdminStats() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const yearStart = new Date(today.getFullYear(), 0, 1)

  const [
    totalUsers,
    usersThisWeek,
    totalProperties,
    activeSubscriptions,
    pendingProperties,
    revenueToday,
    revenueMonth,
    revenueYear,
    recentPayments,
    pendingList,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.property.count(),
    prisma.subscription.count({ where: { status: 'ACTIVE', expiryDate: { gt: new Date() } } }),
    prisma.property.count({ where: { status: 'PENDING' } }),
    prisma.payment.aggregate({
      where: { status: 'SUCCESS', createdAt: { gte: today } },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { status: 'SUCCESS', createdAt: { gte: monthStart } },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { status: 'SUCCESS', createdAt: { gte: yearStart } },
      _sum: { amount: true },
    }),
    prisma.payment.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { phone: true } } },
    }),
    prisma.property.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        owner: { select: { phone: true, name: true } },
        images: { take: 1, orderBy: { sortOrder: 'asc' } },
      },
    }),
  ])

  return {
    totalUsers,
    usersThisWeek,
    totalProperties,
    activeSubscriptions,
    pendingProperties,
    revenue: {
      today: revenueToday._sum.amount ?? 0,
      month: revenueMonth._sum.amount ?? 0,
      year: revenueYear._sum.amount ?? 0,
    },
    recentPayments,
    pendingList,
  }
}
