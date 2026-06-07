import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/api-utils'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()

    const page = Number(req.nextUrl.searchParams.get('page') ?? 1)
    const limit = 30

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { user: { select: { phone: true, name: true } } },
      }),
      prisma.notification.count(),
    ])

    return NextResponse.json({ notifications, total, page })
  } catch (err) {
    return handleApiError(err)
  }
}
