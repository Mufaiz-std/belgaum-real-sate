import { prisma } from '@/lib/prisma'
import { formatIndianPrice } from '@/lib/format'
import { AdminSubscriptionsTable } from '@/components/admin/AdminSubscriptionsTable'

export default async function AdminSubscriptionsPage() {
  const sevenDaysFromNow = new Date()
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

  const [subscriptions, activeCount, expiringSoon, revenue] = await Promise.all([
    prisma.subscription.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { user: { select: { id: true, phone: true } } },
    }),
    prisma.subscription.count({
      where: { status: 'ACTIVE', expiryDate: { gt: new Date() } },
    }),
    prisma.subscription.count({
      where: {
        status: 'ACTIVE',
        expiryDate: { lte: sevenDaysFromNow, gt: new Date() },
      },
    }),
    prisma.payment.aggregate({
      where: { paymentType: 'SUBSCRIPTION', status: 'SUCCESS' },
      _sum: { amount: true },
    }),
  ])

  return (
    <div className="space-y-8">
      <h1 className="font-headline text-2xl text-dark">Subscriptions</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-neutral">Active subscriptions</p>
          <p className="font-mono text-3xl font-bold text-dark">{activeCount}</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-neutral">Expiring in 7 days</p>
          <p className="font-mono text-3xl font-bold text-warning">{expiringSoon}</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-neutral">Total subscription revenue</p>
          <p className="font-mono text-2xl font-bold text-gold">
            {formatIndianPrice(revenue._sum.amount ?? 0)}
          </p>
        </div>
      </div>

      <AdminSubscriptionsTable subscriptions={subscriptions} />
    </div>
  )
}
