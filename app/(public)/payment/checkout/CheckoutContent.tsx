'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { calculateGstBreakdown } from '@/lib/pricing'
import { formatIndianPrice, maskPhone } from '@/lib/format'
import { apiFetch } from '@/lib/api-client'
import { toast } from 'sonner'

const SESSION_TIMEOUT_MS = 15 * 60 * 1000

export function CheckoutContent({ dbPlans }: { dbPlans: any[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan')
  const propertyId = searchParams.get('propertyId')
  const type = searchParams.get('type')

  const isSingle = type === 'single' && !!propertyId
  
  const singlePlan = dbPlans.find(p => p.planKey === 'SINGLE')
  const selectedPlan = dbPlans.find(p => p.planKey === plan)

  const amount = isSingle
    ? (singlePlan?.price || 500)
    : selectedPlan
      ? selectedPlan.price
      : 0

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionExpired, setSessionExpired] = useState(false)
  const [pageLoadedAt] = useState(Date.now())

  const { baseAmount, gstAmount, total } = calculateGstBreakdown(amount)

  const loadUser = useCallback(async () => {
    try {
      const res = await apiFetch('/api/users/me')
      if (res.status === 401) {
        router.push(
          `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`
        )
        return
      }
      const data = await res.json()
      setName(data.user?.name ?? '')
      setEmail(data.user?.email ?? '')
      setPhone(data.user?.phone ?? '')
    } catch {
      toast.error('Failed to load profile')
    }
  }, [router])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js'
    script.async = true
    document.head.appendChild(script)
    return () => {
      document.head.removeChild(script)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setSessionExpired(true), SESSION_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [])

  const getOrderLabel = () => {
    if (isSingle) return singlePlan?.name || 'Single Property Access'
    if (selectedPlan) {
      return `${selectedPlan.name} ${selectedPlan.duration} Plan`
    }
    return 'Subscription'
  }

  const getDuration = () => {
    if (isSingle) return 'Lifetime'
    if (selectedPlan) return selectedPlan.duration
    return '—'
  }

  const handlePayment = async () => {
    if (Date.now() - pageLoadedAt > SESSION_TIMEOUT_MS) {
      setSessionExpired(true)
      return
    }

    if (!isSingle && !plan) {
      setError('Invalid plan selected')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const orderPayload = isSingle
        ? { type: 'SINGLE_PROPERTY' as const, propertyId: propertyId! }
        : { type: 'SUBSCRIPTION' as const, planType: plan! }

      const res = await apiFetch('/api/payments/create-order', {
        method: 'POST',
        body: JSON.stringify(orderPayload),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(
          typeof data.error === 'string' ? data.error : 'Failed to create order'
        )
      }

      if (!window.Cashfree) {
        throw new Error('Payment SDK not loaded')
      }

      const cashfree = window.Cashfree({
        mode: process.env.NEXT_PUBLIC_CASHFREE_ENV ?? 'sandbox',
      })

      await cashfree.checkout({
        paymentSessionId: data.paymentSessionId,
        redirectTarget: '_self',
      })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Payment failed to initialize. Please try again.'
      )
      setLoading(false)
    }
  }

  if (!amount) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <p className="font-body text-neutral">Invalid checkout session.</p>
        <Link href="/pricing" className="mt-4 text-gold hover:underline">
          View Plans
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-8 font-headline text-3xl text-dark">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="font-headline text-xl text-dark">Order Summary</h2>

          <div className="mt-6 space-y-3 font-body text-sm">
            <div className="flex justify-between">
              <span className="text-neutral">Plan</span>
              <span className="font-medium text-dark">{getOrderLabel()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral">Duration</span>
              <span className="text-dark">{getDuration()}</span>
            </div>
          </div>

          <div className="my-6 border-t border-cream-dark" />

          <div className="space-y-2 font-body text-sm">
            <div className="flex justify-between">
              <span className="text-neutral">Subtotal</span>
              <span className="font-mono">{formatIndianPrice(baseAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral">GST (18%)</span>
              <span className="font-mono">{formatIndianPrice(gstAmount)}</span>
            </div>
            <div className="flex justify-between border-t border-cream-dark pt-2 font-semibold">
              <span className="text-dark">Total</span>
              <span className="font-mono text-lg text-gold">
                {formatIndianPrice(total)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="font-headline text-xl text-dark">Customer Details</h2>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="For invoice delivery"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile</Label>
              <Input
                id="phone"
                value={phone ? maskPhone(phone) : ''}
                disabled
                className="bg-cream font-mono text-neutral"
              />
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-error">{error}</p>}

          <Button
            type="button"
            disabled={loading}
            onClick={handlePayment}
            className="mt-8 h-14 w-full bg-gold text-base font-semibold text-dark hover:bg-gold-light"
          >
            {loading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              `Pay ${formatIndianPrice(total)} Securely`
            )}
          </Button>

          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-neutral">
            <Lock className="size-4" />
            <span>Secured by Cashfree</span>
          </div>

          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {['UPI', 'Cards', 'Net Banking', 'Wallets'].map((method) => (
              <span
                key={method}
                className="rounded-full bg-cream px-3 py-1 font-mono text-xs text-neutral"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>

      {sessionExpired && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/50 p-4">
          <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
            <p className="font-body text-dark">
              Your session may have expired. Please refresh and try again.
            </p>
            <Button
              className="mt-4 bg-gold text-dark"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
