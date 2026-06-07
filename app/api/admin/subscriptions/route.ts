import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SubStatus, PlanType } from '@prisma/client'
import { handleApiError } from '@/lib/api-utils'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = req.nextUrl
    const status = searchParams.get('status') as SubStatus | 'ALL' | null
    const planType = searchParams.get('planType') as PlanType | 'ALL' | null
    const page = Number(searchParams.get('page') ?? 1)
    const limit = 20

    const where: { status?: SubStatus; planType?: PlanType } = {}
    if (status && status !== 'ALL') where.status = status
    if (planType && planType !== 'ALL') where.planType = planType

    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

    const [subscriptions, total, activeCount, expiringSoon, revenue] = await Promise.all([
      prisma.subscription.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { user: { select: { phone: true, name: true } } },
      }),
      prisma.subscription.count({ where }),
      prisma.subscription.count({
        where: { status: 'ACTIVE', expiryDate: { gt: new Date() } },
      }),
      prisma.subscription.count({
        where: {
          status: 'ACTIVE',
          expiryDate: { lte: sevenDaysFromNow, gt: new Date() },
        },
      }),
      prisma.payment.aggregate({
        where: { paymentType: 'SUBSCRIPTION', status: 'SUCCESS' },
        _sum: { amount: true },
      }),
    ])

    return NextResponse.json({
      subscriptions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      summary: {
        activeCount,
        expiringSoon,
        totalRevenue: revenue._sum.amount ?? 0,
      },
    })
  } catch (err) {
    return handleApiError(err)
  }
}
