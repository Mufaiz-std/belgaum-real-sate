import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getActiveSubscription } from '@/services/subscriptionService'
import { PaymentSuccessClient } from '@/components/payment/PaymentSuccessClient'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { verifyCashfreePayment } from '@/lib/cashfree'
import { fulfillOrder } from '@/lib/payment-fulfillment'

interface PageProps {
  searchParams: Promise<{ orderId?: string }>
}

export default async function PaymentSuccessPage({ searchParams }: PageProps) {
  const { orderId } = await searchParams

  if (!orderId) {
    redirect('/pricing')
    return null
  }

  let payment = await prisma.payment.findUnique({
    where: { orderId },
    include: {
      user: { select: { email: true } },
    },
  })

  if (!payment) {
    redirect('/pricing')
    return null
  }

  // Sync status directly with Cashfree if it is still PENDING (useful for local development where webhook cannot hit localhost)
  if (payment.status === 'PENDING') {
    try {
      const cfOrder = await verifyCashfreePayment(orderId)
      if (cfOrder && cfOrder.order_status === 'PAID') {
        payment = await fulfillOrder(
          orderId,
          cfOrder.cf_order_id ? String(cfOrder.cf_order_id) : orderId,
          cfOrder
        )
      }
    } catch (err) {
      console.error('Failed to sync payment status on success page:', err)
    }
  }

  const subscription =
    payment.status === 'SUCCESS' && payment.paymentType === 'SUBSCRIPTION'
      ? await getActiveSubscription(payment.userId)
      : null

  return (
    <>
      <Header />
      <main className="flex min-h-screen items-center justify-center bg-cream px-4 pt-20">
        {payment.status === 'SUCCESS' ? (
          <PaymentSuccessClient
            orderId={payment.orderId}
            amount={payment.amount}
            paymentType={payment.paymentType}
            planType={payment.planType}
            invoiceUrl={payment.invoiceUrl}
            expiryDate={subscription?.expiryDate ?? null}
            customerEmail={payment.user.email}
          />
        ) : (
          <div className="w-full max-w-lg rounded-2xl bg-white p-10 text-center shadow-xl">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-warning/10">
              <span className="font-mono text-2xl text-warning">…</span>
            </div>
            <h1 className="font-headline text-2xl text-dark">Payment Processing</h1>
            <p className="mt-2 font-body text-neutral">
              We&apos;re confirming your payment. This may take a moment.
            </p>
            <p className="mt-4 font-mono text-sm text-neutral">Order: {orderId}</p>
            <Link href="/dashboard/payments" className="mt-6 block">
              <Button className="w-full bg-gold text-dark">View Payment History</Button>
            </Link>
          </div>
        )}
      </main>
    </>
  )
}
