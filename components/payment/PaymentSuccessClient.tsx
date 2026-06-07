'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Download, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDate, formatIndianPrice } from '@/lib/format'
import { getPlanLabel } from '@/lib/pricing'

interface PaymentSuccessClientProps {
  orderId: string
  amount: number
  paymentType: string
  planType: string | null
  invoiceUrl: string | null
  expiryDate: Date | null
  customerEmail: string | null
}

export function PaymentSuccessClient({
  orderId,
  amount,
  paymentType,
  planType,
  invoiceUrl,
  expiryDate,
  customerEmail,
}: PaymentSuccessClientProps) {
  const router = useRouter()
  const [countdown, setCountdown] = useState(8)

  useEffect(() => {
    import('canvas-confetti').then(({ default: confetti }) => {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#D4A017', '#0F1115', '#F9F7F2'],
      })
    })
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval)
          router.push('/dashboard')
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [router])

  const planLabel =
    paymentType === 'SUBSCRIPTION' && planType
      ? getPlanLabel(planType)
      : 'Single Property Access'

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-lg rounded-2xl bg-white p-10 shadow-xl"
    >
      <div className="mx-auto mb-6 flex size-20 items-center justify-center">
        <svg viewBox="0 0 52 52" className="size-20">
          <motion.circle
            cx="26"
            cy="26"
            r="24"
            fill="none"
            stroke="#10B981"
            strokeWidth="3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5 }}
          />
          <motion.path
            fill="none"
            stroke="#10B981"
            strokeWidth="3"
            strokeLinecap="round"
            d="M14 27l8 8 16-16"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          />
        </svg>
      </div>

      <h1 className="text-center font-headline text-[32px] text-dark">
        Payment Successful!
      </h1>
      <p className="mt-2 text-center font-body text-neutral">
        Your access has been activated.
      </p>

      <div className="my-8 space-y-3 border-y border-cream-dark py-6 font-body text-sm">
        <div className="flex justify-between">
          <span className="text-neutral">Transaction ID</span>
          <span className="font-mono text-dark">{orderId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral">Amount Paid</span>
          <span className="font-mono font-medium text-dark">
            {formatIndianPrice(amount)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral">Plan</span>
          <span className="text-dark">{planLabel}</span>
        </div>
        {expiryDate && (
          <div className="flex justify-between">
            <span className="text-neutral">Valid Until</span>
            <span className="font-mono text-dark">{formatDate(expiryDate)}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {invoiceUrl && (
          <Link href={invoiceUrl} target="_blank">
            <Button variant="outline" className="w-full gap-2 border-gold text-gold">
              <Download className="size-4" />
              Download Invoice
            </Button>
          </Link>
        )}
        <Link href="/dashboard">
          <Button className="w-full bg-dark text-white hover:bg-dark/90">
            Go to Dashboard
          </Button>
        </Link>
        <Link href="/properties">
          <Button variant="ghost" className="w-full">
            Browse Properties
          </Button>
        </Link>
      </div>

      {customerEmail && (
        <p className="mt-6 flex items-center justify-center gap-2 font-body text-sm text-neutral">
          <Mail className="size-4" />
          Invoice sent to your email
        </p>
      )}

      <p className="mt-4 text-center font-mono text-xs text-neutral">
        Redirecting to dashboard in {countdown} seconds...
      </p>
    </motion.div>
  )
}
