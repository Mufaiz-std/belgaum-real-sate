import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PaymentStatus, PaymentType } from '@prisma/client'
import { handleApiError } from '@/lib/api-utils'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = req.nextUrl
    const status = searchParams.get('status') as PaymentStatus | 'ALL' | null
    const paymentType = searchParams.get('type') as PaymentType | 'ALL' | null
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const search = searchParams.get('search')

    const where: {
      status?: PaymentStatus
      paymentType?: PaymentType
      createdAt?: { gte?: Date; lte?: Date }
      transactionId?: { contains: string }
    } = {}

    if (status && status !== 'ALL') where.status = status
    if (paymentType && paymentType !== 'ALL') where.paymentType = paymentType
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }
    if (search) where.transactionId = { contains: search }

    const payments = await prisma.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { phone: true } } },
    })

    const csv = [
      'Date,Transaction ID,User,Type,Amount,Status',
      ...payments.map(
        (p) =>
          `${p.createdAt.toISOString()},${p.transactionId},${p.user.phone},${p.paymentType},${p.amount},${p.status}`
      ),
    ].join('\n')

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="payments-${Date.now()}.csv"`,
      },
    })
  } catch (err) {
    return handleApiError(err)
  }
}
