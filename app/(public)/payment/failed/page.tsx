'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { XCircle } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'

function FailedContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const plan = searchParams.get('plan')
  const propertyId = searchParams.get('propertyId')
  const type = searchParams.get('type')
  const reason = searchParams.get('reason') ?? 'Payment was not completed'

  const retryHref =
    type === 'single' && propertyId
      ? `/payment/checkout?type=single&propertyId=${propertyId}`
      : plan
        ? `/payment/checkout?plan=${plan}`
        : '/pricing'

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="w-full max-w-lg rounded-2xl bg-white p-10 text-center shadow-xl"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-error/10"
      >
        <XCircle className="size-12 text-error" />
      </motion.div>

      <h1 className="font-headline text-[32px] text-dark">Payment Failed</h1>
      <p className="mt-2 font-body text-neutral">
        Something went wrong with your payment.
      </p>

      <p className="mt-4 font-mono text-sm text-error">{reason}</p>

      {orderId && (
        <div className="my-6 border-y border-cream-dark py-4">
          <p className="font-mono text-sm text-neutral">
            Order ID: <span className="text-dark">{orderId}</span>
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Link href={retryHref}>
          <Button className="w-full bg-gold text-dark hover:bg-gold-light">
            Try Again
          </Button>
        </Link>
        <Link href="/contact">
          <Button variant="outline" className="w-full border-dark text-dark">
            Contact Support
          </Button>
        </Link>
        <Link href="/pricing">
          <Button variant="ghost" className="w-full">
            Back to Plans
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}

export default function PaymentFailedPage() {
  return (
    <>
      <Header />
      <main className="flex min-h-screen items-center justify-center bg-cream px-4 pt-20">
        <Suspense fallback={<div className="text-neutral">Loading...</div>}>
          <FailedContent />
        </Suspense>
      </main>
    </>
  )
}
