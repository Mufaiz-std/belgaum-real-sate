import { prisma } from './prisma'
import { createSubscription } from '@/services/subscriptionService'
import { generateInvoice } from '@/services/invoiceService'
import { sendPaymentSuccessEmail } from '@/services/notificationService'
import { sendPaymentSuccessWhatsApp } from '@/services/whatsappService'

export async function fulfillOrder(orderId: string, cashfreeTransactionId: string, metadata: any) {
  const payment = await prisma.payment.findUnique({
    where: { orderId },
    include: {
      user: { select: { email: true } },
    },
  })
  if (!payment) {
    throw new Error('Order not found')
  }
  if (payment.status === 'SUCCESS') {
    return payment
  }

  const updatedPayment = await prisma.payment.update({
    where: { orderId },
    data: {
      status: 'SUCCESS',
      transactionId: String(cashfreeTransactionId),
      metadata: metadata,
    },
  })

  if (payment.paymentType === 'SUBSCRIPTION' && payment.planType) {
    const planType = payment.planType as 'BASIC' | 'PREMIUM' | 'GOLD'
    if (['BASIC', 'PREMIUM', 'GOLD'].includes(planType)) {
      await createSubscription(payment.userId, planType, payment.id, payment.amount)
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

  let invoiceUrl: string | null = null
  try {
    invoiceUrl = await generateInvoice({
      orderId,
      amount: payment.amount,
      paymentType: payment.paymentType,
      planType: payment.planType,
      customerName: user?.name ?? 'Customer',
      customerPhone: user?.phone ?? '',
      createdAt: payment.createdAt,
    })

    if (invoiceUrl) {
      await prisma.payment.update({
        where: { orderId },
        data: { invoiceUrl },
      })
    }
  } catch (err) {
    console.error('Invoice generation failed:', err)
  }

  try {
    await sendPaymentSuccessEmail({
      to: user?.email ?? '',
      customerName: user?.name ?? 'Customer',
      orderId,
      amount: payment.amount,
      planType: payment.planType,
      invoiceUrl: invoiceUrl ?? '',
    })
  } catch (emailErr) {
    console.error('Failed to send success email:', emailErr)
  }

  try {
    if (user?.phone) {
      await sendPaymentSuccessWhatsApp(
        user.phone,
        payment.amount,
        payment.planType
      )
    }
  } catch (wsErr) {
    console.error('Failed to send WhatsApp:', wsErr)
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

  const finalPayment = await prisma.payment.findUnique({
    where: { orderId },
    include: {
      user: { select: { email: true } }
    }
  })

  return finalPayment!
}
