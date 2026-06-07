import { NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/cashfree'
import { prisma } from '@/lib/prisma'
import { createSubscription } from '@/services/subscriptionService'
import { generateInvoice } from '@/services/invoiceService'
import { sendPaymentSuccessEmail } from '@/services/notificationService'
import { sendPaymentSuccessWhatsApp } from '@/services/whatsappService'

export async function POST(req: Request) {
  const body = await req.text()
  const timestamp = req.headers.get('x-webhook-timestamp') ?? ''
  const signature = req.headers.get('x-webhook-signature') ?? ''

  if (!verifyWebhookSignature(body, timestamp, signature)) {
    console.error('Invalid Cashfree webhook signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(body)
  const { type, data } = event

  if (type !== 'PAYMENT_SUCCESS_WEBHOOK') {
    return NextResponse.json({ received: true })
  }

  const orderId = data.order.order_id
  const cashfreeTransactionId = data.payment.cf_payment_id

  try {
    const payment = await prisma.payment.findUnique({ where: { orderId } })
    if (!payment) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    if (payment.status === 'SUCCESS') {
      return NextResponse.json({ received: true })
    }

    await prisma.payment.update({
      where: { orderId },
      data: {
        status: 'SUCCESS',
        transactionId: String(cashfreeTransactionId),
        metadata: data,
      },
    })

    if (payment.paymentType === 'SUBSCRIPTION' && payment.planType) {
      const planType = payment.planType as 'BASIC' | 'PREMIUM' | 'GOLD'
      if (['BASIC', 'PREMIUM', 'GOLD'].includes(planType)) {
        await createSubscription(payment.userId, planType, payment.id)
      }
    }

    if (payment.paymentType === 'SINGLE_PROPERTY' && payment.propertyId) {
      await prisma.propertyUnlock.upsert({
        where: {
          userId_propertyId: {
            userId: payment.userId,
            propertyId: payment.propertyId,
          },
        },
        create: {
          userId: payment.userId,
          propertyId: payment.propertyId,
          paymentId: payment.id,
        },
        update: {},
      })
    }

    const user = await prisma.user.findUnique({
      where: { id: payment.userId },
      select: { phone: true, name: true, email: true },
    })

    const invoiceUrl = await generateInvoice({
      orderId,
      amount: payment.amount,
      paymentType: payment.paymentType,
      planType: payment.planType,
      customerName: user?.name ?? 'Customer',
      customerPhone: user?.phone ?? '',
      createdAt: payment.createdAt,
    })

    await prisma.payment.update({
      where: { orderId },
      data: { invoiceUrl },
    })

    await sendPaymentSuccessEmail({
      to: user?.email ?? '',
      customerName: user?.name ?? 'Customer',
      orderId,
      amount: payment.amount,
      planType: payment.planType,
      invoiceUrl,
    })

    if (user?.phone) {
      await sendPaymentSuccessWhatsApp(
        user.phone,
        payment.amount,
        payment.planType
      )
    }

    await prisma.notification.create({
      data: {
        userId: payment.userId,
        title: 'Payment Successful',
        body: `Your payment of ₹${payment.amount} was successful. ${
          payment.paymentType === 'SUBSCRIPTION'
            ? 'Your subscription is now active.'
            : 'Property unlocked successfully.'
        }`,
        link: '/dashboard/payments',
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: payment.userId,
        action: 'PAYMENT_SUCCESS',
        metadata: {
          orderId,
          amount: payment.amount,
          type: payment.paymentType,
        },
      },
    })

    return NextResponse.json({ received: true, success: true })
  } catch (err) {
    console.error('Webhook processing error:', err)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
