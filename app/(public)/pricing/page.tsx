import { getSession } from '@/lib/auth'
import { getActiveSubscription } from '@/services/subscriptionService'
import { getRemainingTokens } from '@/services/tokenService'
import { prisma } from '@/lib/prisma'
import { PricingPlans } from '@/components/pricing/PricingPlans'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import type { PlanKey } from '@/lib/pricing'

export default async function PricingPage() {
  const session = await getSession()

  let currentPlan: string | null = null
  let subscriptionExpiry: Date | null = null
  let tokensRemaining = 0

  const dbPlans = await prisma.planConfig.findMany({
    where: { isActive: true },
    orderBy: { price: 'asc' },
  })

  if (session?.userId) {
    const [subscription, tokens] = await Promise.all([
      getActiveSubscription(session.userId),
      getRemainingTokens(session.userId),
    ])
    if (subscription) {
      currentPlan = subscription.planType
      subscriptionExpiry = subscription.expiryDate
      tokensRemaining = tokens
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream pt-20">
        <PricingPlans
          isLoggedIn={!!session}
          currentPlan={currentPlan}
          subscriptionExpiry={subscriptionExpiry}
          tokensRemaining={tokensRemaining}
          dbPlans={dbPlans}
        />
      </main>
      <Footer />
    </>
  )
}
