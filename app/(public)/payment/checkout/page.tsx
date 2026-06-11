import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { prisma } from '@/lib/prisma'
import { CheckoutContent } from './CheckoutContent'

export default async function CheckoutPage() {
  const dbPlans = await prisma.planConfig.findMany({
    where: { isActive: true }
  })

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream pt-20">
        <Suspense
          fallback={
            <div className="flex min-h-[60vh] items-center justify-center">
              <Loader2 className="size-8 animate-spin text-gold" />
            </div>
          }
        >
          <CheckoutContent dbPlans={dbPlans} />
        </Suspense>
      </main>
    </>
  )
}
