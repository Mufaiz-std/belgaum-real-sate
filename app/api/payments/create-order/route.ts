import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createCashfreeOrder } from '@/lib/cashfree'
import { PLAN_AMOUNTS } from '@/lib/pricing'
import { requireCsrfForMutation, handleApiError } from '@/lib/api-utils'
import { z } from 'zod'
import { nanoid } from 'nanoid'

const orderSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('SUBSCRIPTION'),
    planType: z.enum(['BASIC', 'PREMIUM', 'GOLD']),
  }),
  z.object({
    type: z.literal('SINGLE_PROPERTY'),
    propertyId: z.string(),
  }),
])

export async function POST(req: Request) {
  try {
    await requireCsrfForMutation(req)
    const session = await requireAuth()
    const body = await req.json()
    const input = orderSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, name: true, phone: true, email: true },
    })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const orderId = `BRE-${nanoid(10).toUpperCase()}`
    const amount =
      input.type === 'SUBSCRIPTION'
        ? PLAN_AMOUNTS[input.planType]
        : PLAN_AMOUNTS.SINGLE

    if (input.type === 'SINGLE_PROPERTY') {
      const property = await prisma.property.findUnique({
        where: { id: input.propertyId, status: 'ACTIVE' },
      })
      if (!property) {
        return NextResponse.json({ error: 'Property not found' }, { status: 404 })
      }

      const existingUnlock = await prisma.propertyUnlock.findUnique({
        where: {
          userId_propertyId: {
            userId: session.userId,
            propertyId: input.propertyId,
          },
        },
      })
      if (existingUnlock) {
        return NextResponse.json({ error: 'Property already unlocked' }, { status: 400 })
      }
    }

    await prisma.payment.create({
      data: {
        userId: session.userId,
        transactionId: orderId,
        orderId,
        amount,
        paymentType:
          input.type === 'SUBSCRIPTION' ? 'SUBSCRIPTION' : 'SINGLE_PROPERTY',
        planType: input.type === 'SUBSCRIPTION' ? input.planType : 'SINGLE',
        propertyId: input.type === 'SINGLE_PROPERTY' ? input.propertyId : null,
        status: 'PENDING',
      },
    })

    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?orderId=${orderId}`

    const cashfreeOrder = await createCashfreeOrder({
      orderId,
      amount,
      customerName: user.name ?? 'Customer',
      customerPhone: user.phone,
      customerEmail: user.email ?? '',
      returnUrl,
      planType: input.type === 'SUBSCRIPTION' ? input.planType : undefined,
      propertyId: input.type === 'SINGLE_PROPERTY' ? input.propertyId : undefined,
      userId: session.userId,
    })

    return NextResponse.json({
      orderId,
      paymentSessionId: cashfreeOrder.payment_session_id,
      amount,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 })
    }
    return handleApiError(err)
  }
}
