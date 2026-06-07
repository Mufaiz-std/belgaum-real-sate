import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/api-utils'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()
    const limit = Number(req.nextUrl.searchParams.get('limit') ?? 50)

    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { user: { select: { phone: true } } },
    })

    return NextResponse.json({ payments })
  } catch (err) {
    return handleApiError(err)
  }
}
