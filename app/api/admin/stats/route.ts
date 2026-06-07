import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/api-utils'

export async function GET() {
  try {
    await requireAdmin()

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const yearStart = new Date(today.getFullYear(), 0, 1)

    const [
      totalUsers,
      totalProperties,
      pendingProperties,
      activeSubscriptions,
      revenueToday,
      revenueMonth,
      revenueYear,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.property.count(),
      prisma.property.count({ where: { status: 'PENDING' } }),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
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
    ])

    return NextResponse.json({
      totalUsers,
      totalProperties,
      pendingProperties,
      activeSubscriptions,
      revenue: {
        today: revenueToday._sum.amount ?? 0,
        month: revenueMonth._sum.amount ?? 0,
        year: revenueYear._sum.amount ?? 0,
      },
    })
  } catch (err) {
    return handleApiError(err)
  }
}
