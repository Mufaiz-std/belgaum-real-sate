import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PropertyStatus } from '@prisma/client'
import { handleApiError } from '@/lib/api-utils'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = req.nextUrl
    const status = searchParams.get('status') ?? undefined
    const page = Number(searchParams.get('page') ?? 1)
    const limit = 20

    const where = status ? { status: status as PropertyStatus } : {}

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          owner: { select: { phone: true, name: true } },
          images: { take: 1, orderBy: { sortOrder: 'asc' } },
        },
      }),
      prisma.property.count({ where }),
    ])

    return NextResponse.json({
      properties,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (err) {
    return handleApiError(err)
  }
}
