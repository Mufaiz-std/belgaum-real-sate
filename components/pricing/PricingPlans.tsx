'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Check, Minus, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { PLAN_AMOUNTS, PLAN_DETAILS, type PlanKey } from '@/lib/pricing'
import { formatDate, formatIndianPrice } from '@/lib/format'
import { apiFetch } from '@/lib/api-client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const PLANS: PlanKey[] = ['BASIC', 'PREMIUM', 'GOLD']

const FEATURE_ROWS = [
  { key: 'contactAccess', label: 'Contact Access' },
  { key: 'uploadProperties', label: 'Upload Properties' },
  { key: 'dailyViews', label: '15 Views/Day' },
  { key: 'prioritySupport', label: 'Priority Support' },
  { key: 'featuredListings', label: 'Featured Listings' },
] as const

const FAQ_ITEMS = [
  {
    q: 'Can I upgrade my plan?',
    a: 'Yes, upgrade anytime. Remaining days are credited.',
  },
  {
    q: 'Is there a refund policy?',
    a: 'Payments are non-refundable. Contact support for disputes.',
  },
  {
    q: 'What happens when my plan expires?',
    a: 'You lose access to contact details. Your uploaded properties remain active.',
  },
  {
    q: 'Is GST included in the price?',
    a: 'Prices shown are inclusive of 18% GST.',
  },
]

interface PricingPlansProps {
  isLoggedIn: boolean
  currentPlan: PlanKey | null
  subscriptionExpiry: Date | null
  tokensRemaining: number
}

export function PricingPlans({
  isLoggedIn,
  currentPlan,
  subscriptionExpiry,
  tokensRemaining,
}: PricingPlansProps) {
  const router = useRouter()
  const [loadingPlan, setLoadingPlan] = useState<PlanKey | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const handleSubscribe = async (plan: PlanKey) => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=/pricing`)
      return
    }

    if (currentPlan === plan) return

    setLoadingPlan(plan)
    router.push(`/payment/checkout?plan=${plan}`)
    setLoadingPlan(null)
  }

  const getCta = (plan: PlanKey) => {
    if (!isLoggedIn) return { label: 'Get Started', disabled: false }
    if (currentPlan === plan) return { label: 'Current Plan', disabled: true }
    if (currentPlan) return { label: 'Upgrade Plan', disabled: false }
    return { label: 'Subscribe Now', disabled: false }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-16 text-center">
        <h1 className="font-headline text-4xl text-dark md:text-[42px]">
          Simple, Transparent Pricing
        </h1>
        <p className="mx-auto mt-4 max-w-xl font-body text-neutral">
          Pay only for what you need. No hidden charges. No brokerage.
        </p>
      </div>

      {currentPlan && subscriptionExpiry && (
        <div className="mb-12 flex flex-col items-start justify-between gap-4 rounded-2xl bg-dark p-6 text-white sm:flex-row sm:items-center">
          <div>
            <span className="font-mono text-sm text-gold">CURRENT PLAN</span>
            <h3 className="mt-1 font-headline text-2xl">{currentPlan} Plan</h3>
            <p className="mt-1 font-body text-sm text-cream/60">
              Valid until {formatDate(subscriptionExpiry)}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <div className="font-mono text-lg text-gold">
              {tokensRemaining} / 15
            </div>
            <div className="font-body text-sm text-cream/60">tokens today</div>
          </div>
        </div>
      )}

      <div className="mb-16 grid gap-6 md:grid-cols-3">
        {PLANS.map((plan, index) => {
          const details = PLAN_DETAILS[plan]
          const isPremium = plan === 'PREMIUM'
          const cta = getCta(plan)

          return (
            <motion.div
              key={plan}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={!isPremium ? { y: -8 } : undefined}
              className={cn(
                'relative flex flex-col rounded-2xl p-8 shadow-md transition-shadow',
                isPremium
                  ? 'scale-[1.02] bg-dark text-white shadow-xl'
                  : 'border border-cream-dark bg-white hover:border-gold hover:shadow-lg'
              )}
            >
              {details.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-1 font-mono text-xs font-bold text-dark">
                  {details.badge}
                </span>
              )}

              <span
                className={cn(
                  'font-mono text-xs uppercase',
                  isPremium ? 'text-gold' : 'text-neutral'
                )}
              >
                {details.name}
              </span>
              <p
                className={cn(
                  'mt-1 font-body text-lg',
                  isPremium ? 'text-cream' : 'text-dark'
                )}
              >
                {details.duration}
              </p>
              <p className="mt-4 font-mono text-5xl font-bold text-gold">
                {formatIndianPrice(PLAN_AMOUNTS[plan])}
              </p>
              <p
                className={cn(
                  'mt-1 font-body text-xs',
                  isPremium ? 'text-cream/60' : 'text-neutral'
                )}
              >
                + GST included
              </p>

              <ul className="mt-8 flex-1 space-y-3">
                {FEATURE_ROWS.map((feature) => {
                  const enabled =
                    details.features[feature.key as keyof typeof details.features]
                  return (
                    <li key={feature.key} className="flex items-center gap-2">
                      {enabled ? (
                        <Check className="size-4 shrink-0 text-gold" />
                      ) : (
                        <Minus
                          className={cn(
                            'size-4 shrink-0',
                            isPremium ? 'text-cream/40' : 'text-neutral'
                          )}
                        />
                      )}
                      <span
                        className={cn(
                          'font-body text-sm',
                          enabled
                            ? isPremium
                              ? 'text-cream'
                              : 'text-dark'
                            : isPremium
                              ? 'text-cream/40'
                              : 'text-neutral'
                        )}
                      >
                        {feature.label}
                      </span>
                    </li>
                  )
                })}
              </ul>

              <button
                type="button"
                disabled={cta.disabled || loadingPlan === plan}
                onClick={() => handleSubscribe(plan)}
                className={cn(
                  'mt-8 w-full rounded-lg py-3.5 font-body font-semibold transition-colors',
                  cta.disabled
                    ? 'cursor-not-allowed bg-neutral/20 text-neutral'
                    : isPremium
                      ? 'bg-gold text-dark hover:bg-gold-light'
                      : 'bg-gold text-dark hover:bg-gold-light'
                )}
              >
                {loadingPlan === plan ? (
                  <Loader2 className="mx-auto size-5 animate-spin" />
                ) : (
                  cta.label
                )}
              </button>
            </motion.div>
          )
        })}
      </div>

      <div className="mb-16">
        <p className="mb-4 text-center font-mono text-xs uppercase tracking-wider text-neutral">
          Just browsing? Access one property.
        </p>
        <div className="mx-auto max-w-2xl rounded-2xl border border-cream-dark bg-white p-8 shadow-sm">
          <h3 className="font-mono text-sm uppercase text-gold">Single Property Access</h3>
          <p className="mt-2 font-body text-neutral">Unlock one listing, forever.</p>
          <p className="mt-4 font-mono text-4xl font-bold text-gold">
            {formatIndianPrice(PLAN_AMOUNTS.SINGLE)}
          </p>
          <p className="font-body text-sm text-neutral">One-time · Lifetime access</p>
          <ul className="mt-6 space-y-2 font-body text-sm text-dark">
            <li className="flex items-center gap-2">
              <Check className="size-4 text-gold" /> Full image gallery
            </li>
            <li className="flex items-center gap-2">
              <Check className="size-4 text-gold" /> Owner contact (phone + WhatsApp)
            </li>
            <li className="flex items-center gap-2">
              <Check className="size-4 text-gold" /> Exact map location
            </li>
            <li className="flex items-center gap-2">
              <Check className="size-4 text-gold" /> Valid forever — no expiry
            </li>
          </ul>
          <Link
            href="/properties"
            className="mt-6 block w-full rounded-lg bg-gold py-3 text-center font-body font-semibold text-dark hover:bg-gold-light"
          >
            Browse Properties to Unlock
          </Link>
        </div>
      </div>

      <div className="mb-16 overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full min-w-[600px]">
          <thead className="sticky top-0 bg-dark text-white">
            <tr>
              <th className="p-4 text-left font-body text-sm">Feature</th>
              {PLANS.map((plan) => (
                <th key={plan} className="p-4 text-center font-mono text-sm text-gold">
                  {plan}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FEATURE_ROWS.map((feature, i) => (
              <tr
                key={feature.key}
                className={i % 2 === 0 ? 'bg-cream/50' : 'bg-white'}
              >
                <td className="p-4 font-body text-sm text-dark">{feature.label}</td>
                {PLANS.map((plan) => {
                  const enabled =
                    PLAN_DETAILS[plan].features[
                      feature.key as keyof (typeof PLAN_DETAILS)[PlanKey]['features']
                    ]
                  return (
                    <td key={plan} className="p-4 text-center">
                      {enabled ? (
                        <Check className="mx-auto size-5 text-gold" />
                      ) : (
                        <Minus className="mx-auto size-5 text-neutral" />
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mx-auto max-w-2xl">
        <h2 className="mb-6 text-center font-headline text-2xl text-dark">FAQ</h2>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <div key={item.q} className="overflow-hidden rounded-xl border border-cream-dark bg-white">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between p-4 text-left font-body font-medium text-dark"
              >
                {item.q}
                <span className="text-gold">{openFaq === i ? '−' : '+'}</span>
              </button>
              {openFaq === i && (
                <p className="border-t border-cream-dark px-4 pb-4 font-body text-sm text-neutral">
                  {item.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
