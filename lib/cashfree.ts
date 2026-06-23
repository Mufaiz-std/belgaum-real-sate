import { createHmac } from 'crypto'

const CASHFREE_BASE_URL =
  process.env.CASHFREE_ENV === 'PROD'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg'

const CASHFREE_HEADERS = {
  'Content-Type': 'application/json',
  'x-api-version': '2023-08-01',
  'x-client-id': process.env.CASHFREE_APP_ID!,
  'x-client-secret': process.env.CASHFREE_SECRET_KEY!,
}

export interface CreateOrderParams {
  orderId: string
  amount: number
  customerName: string
  customerPhone: string
  customerEmail: string
  returnUrl: string
  planType?: string
  propertyId?: string
  userId: string
}

export interface CashfreeOrder {
  order_id: string
  payment_session_id: string
  order_status: string
}

export async function createCashfreeOrder(params: CreateOrderParams): Promise<CashfreeOrder> {
  const body = {
    order_id: params.orderId,
    order_amount: params.amount,
    order_currency: 'INR',
    customer_details: {
      customer_id: params.userId,
      customer_name: params.customerName,
      customer_phone: params.customerPhone,
      customer_email:
        params.customerEmail || `${params.customerPhone}@xcityrealestate.in`,
    },
    order_meta: {
      return_url: params.returnUrl,
      notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`,
    },
    order_tags: {
      planType: params.planType ?? '',
      propertyId: params.propertyId ?? '',
      userId: params.userId,
    },
  }

  const res = await fetch(`${CASHFREE_BASE_URL}/orders`, {
    method: 'POST',
    headers: CASHFREE_HEADERS,
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(`Cashfree order creation failed: ${JSON.stringify(err)}`)
  }

  return res.json()
}

export async function verifyCashfreePayment(orderId: string) {
  const res = await fetch(`${CASHFREE_BASE_URL}/orders/${orderId}`, {
    method: 'GET',
    headers: CASHFREE_HEADERS,
  })
  return res.json()
}

export function verifyWebhookSignature(
  payload: string,
  timestamp: string,
  signature: string
): boolean {
  const data = timestamp + payload
  const hmac = createHmac('sha256', process.env.CASHFREE_WEBHOOK_SECRET!)
    .update(data)
    .digest('base64')
  return hmac === signature
}
