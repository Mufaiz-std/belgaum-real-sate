import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTokenUsageToday } from '@/lib/dashboard'
import { formatDate, formatIndianPrice } from '@/lib/format'
import { DAILY_TOKEN_LIMIT } from '@/lib/constants'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'
import { Star } from 'lucide-react'

export default async function SubscriptionPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [activeSubscription, history, tokensToday] = await Promise.all([
    prisma.subscription.findFirst({
      where: {
        userId: session.userId,
        status: 'ACTIVE',
        expiryDate: { gt: new Date() },
      },
      orderBy: { expiryDate: 'desc' },
    }),
    prisma.subscription.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
    }),
    getTokenUsageToday(session.userId),
  ])

  const remainingPercent = activeSubscription
    ? Math.max(
        0,
        Math.min(
          100,
          ((activeSubscription.expiryDate.getTime() - Date.now()) /
            (activeSubscription.expiryDate.getTime() - activeSubscription.startDate.getTime())) *
            100
        )
      )
    : 0

  const latestSubscription = history[0]
  const isCancelledByAdmin = !activeSubscription && latestSubscription?.status === 'CANCELLED'

  const dailyLimit = activeSubscription?.dailyLimit ?? DAILY_TOKEN_LIMIT
  const tokenPercent = (tokensToday / dailyLimit) * 100

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-2xl text-dark">Subscription</h1>
        <p className="mt-1 font-body text-neutral">Manage your plan and usage</p>
      </div>

      {activeSubscription ? (
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gold/10 px-3 py-1">
            <Star className="size-4 text-gold" />
            <span className="font-mono text-xs font-bold uppercase text-gold">
              {activeSubscription.planType} PLAN
            </span>
          </div>
          <h2 className="font-headline text-xl text-dark">
            {activeSubscription.planType} Subscription
          </h2>
          <p className="mt-2 font-mono text-sm text-neutral">
            Valid until: {formatDate(activeSubscription.expiryDate)}
          </p>

          <div className="mt-6">
            <div className="mb-2 flex justify-between font-body text-sm">
              <span className="text-neutral">Plan remaining</span>
              <span className="font-mono text-dark">{Math.round(remainingPercent)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-cream-dark">
              <div
                className="h-full rounded-full bg-gold transition-all"
                style={{ width: `${remainingPercent}%` }}
              />
            </div>
          </div>

          <div className="mt-6">
            <p className="font-body text-sm text-neutral">
              Daily Usage:{' '}
              <span className="font-mono text-dark">
                {tokensToday} / {dailyLimit} tokens
              </span>
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-cream-dark">
              <div
                className="h-full rounded-full bg-success transition-all"
                style={{ width: `${tokenPercent}%` }}
              />
            </div>
          </div>

          <Link href="/pricing">
            <Button className="mt-6 bg-gold text-dark hover:bg-gold-light">
              Upgrade to Gold
            </Button>
          </Link>
        </div>
      ) : isCancelledByAdmin ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm border border-red-200">
          <p className="font-body text-red-600 font-semibold">Your subscription has been cancelled by the admin.</p>
          <p className="mt-2 font-body text-neutral text-sm">
            Please contact the administration for more information regarding your account status.
          </p>
          <a
            href="https://wa.me/918904701510?text=Hello%20Admin%2C%20my%20subscription%20on%20Belgaum%20Real%20Estate%20was%20cancelled.%20Can%20you%20please%20help%20me%20with%20this%3F"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block rounded-xl bg-[#25D366] px-6 py-3 font-body font-bold text-white hover:bg-[#20ba5a] transition-colors shadow-sm"
          >
            Contact Admin on WhatsApp
          </a>
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="font-body text-neutral">You don&apos;t have an active plan</p>
          <Link href="/pricing">
            <Button className="mt-4 bg-gold text-dark hover:bg-gold-light">
              View Plans
            </Button>
          </Link>
        </div>
      )}

      <div>
        <h2 className="mb-4 font-headline text-xl text-dark">Subscription History</h2>
        {history.length > 0 ? (
          <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-cream-dark text-left">
                  <th className="p-4 font-body text-sm font-medium text-neutral">Plan</th>
                  <th className="p-4 font-body text-sm font-medium text-neutral">Amount</th>
                  <th className="p-4 font-body text-sm font-medium text-neutral">Start</th>
                  <th className="p-4 font-body text-sm font-medium text-neutral">Expiry</th>
                  <th className="p-4 font-body text-sm font-medium text-neutral">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((sub) => (
                  <tr key={sub.id} className="border-b border-cream-dark/50 last:border-0">
                    <td className="p-4 font-body font-medium text-dark">{sub.planType}</td>
                    <td className="p-4 font-mono text-sm text-dark">
                      {formatIndianPrice(sub.amount)}
                    </td>
                    <td className="p-4 font-mono text-sm text-neutral">
                      {formatDate(sub.startDate)}
                    </td>
                    <td className="p-4 font-mono text-sm text-neutral">
                      {formatDate(sub.expiryDate)}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={sub.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="font-body text-neutral">No subscription history yet.</p>
        )}
      </div>
    </div>
  )
}
