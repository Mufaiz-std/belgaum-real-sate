import { NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/cashfree'
import { prisma } from '@/lib/prisma'
import { fulfillOrder } from '@/lib/payment-fulfillment'

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

    await fulfillOrder(orderId, String(cashfreeTransactionId), data)

    return NextResponse.json({ received: true, success: true })
  } catch (err) {
    console.error('Webhook processing error:', err)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
