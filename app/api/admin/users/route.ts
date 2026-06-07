import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Role, UserStatus } from '@prisma/client'
import { handleApiError } from '@/lib/api-utils'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = req.nextUrl
    const search = searchParams.get('search') ?? ''
    const role = searchParams.get('role') as Role | 'ALL' | null
    const status = searchParams.get('status') as UserStatus | 'ALL' | null
    const page = Number(searchParams.get('page') ?? 1)
    const limit = 20

    const where: {
      OR?: { phone?: { contains: string }; name?: { contains: string; mode: 'insensitive' } }[]
      role?: Role
      status?: UserStatus
    } = {}

    if (search) {
      where.OR = [
        { phone: { contains: search } },
        { name: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (role && role !== 'ALL') where.role = role
    if (status && status !== 'ALL') where.status = status

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          subscriptions: {
            where: { status: 'ACTIVE', expiryDate: { gt: new Date() } },
            take: 1,
          },
          _count: { select: { properties: true } },
        },
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (err) {
    return handleApiError(err)
  }
}
