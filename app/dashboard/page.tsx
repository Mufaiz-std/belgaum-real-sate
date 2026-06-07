import Link from 'next/link'
import { Building2, Eye, Zap, Calendar, PlusCircle } from 'lucide-react'
import { getSession } from '@/lib/auth'
import { getDashboardUser, getDashboardStats, getUserProperties } from '@/lib/dashboard'
import { getGreeting, maskPhone, formatDate } from '@/lib/format'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { PropertiesTable } from '@/components/dashboard/PropertiesTable'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [user, stats, { properties }] = await Promise.all([
    getDashboardUser(session.userId),
    getDashboardStats(session.userId),
    getUserProperties(session.userId, { limit: 5 }),
  ])

  if (!user) redirect('/login')

  const tableRows = properties.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    area: p.area,
    status: p.status,
    coverImage: p.images[0]?.imageUrl,
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-2xl text-dark">
          {getGreeting()}, {maskPhone(user.phone)}
        </h1>
        <p className="mt-1 font-body text-neutral">
          Here&apos;s what&apos;s happening with your properties.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Active Listings"
          value={stats.activeListings}
          icon={Building2}
          borderColor="border-l-gold"
          iconColor="text-gold"
        />
        <StatsCard
          label="Total Views"
          value={stats.totalViews}
          icon={Eye}
          borderColor="border-l-blue-500"
          iconColor="text-blue-500"
        />
        <StatsCard
          label="Tokens Today"
          value={
            stats.isSubscriber
              ? `${stats.tokensToday} / ${stats.tokenLimit}`
              : '—'
          }
          icon={Zap}
          borderColor="border-l-success"
          iconColor="text-success"
          action={
            !stats.isSubscriber
              ? { label: 'Upgrade to get access', href: '/pricing' }
              : undefined
          }
        />
        <StatsCard
          label="Subscription Expires"
          value={
            stats.subscription
              ? formatDate(stats.subscription.expiryDate)
              : 'No active plan'
          }
          icon={Calendar}
          borderColor="border-l-warning"
          iconColor="text-warning"
          action={
            !stats.subscription
              ? { label: 'View Plans', href: '/pricing' }
              : undefined
          }
        />
      </div>

      <div>
        <h2 className="mb-4 font-headline text-xl text-dark">Recent Properties</h2>
        {tableRows.length > 0 ? (
          <PropertiesTable properties={tableRows} />
        ) : (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm">
            <p className="font-body text-neutral">
              You haven&apos;t uploaded any properties yet.
            </p>
            <Link href="/dashboard/upload">
              <Button className="mt-4 bg-gold text-dark hover:bg-gold-light">
                Upload Now
              </Button>
            </Link>
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-4 font-headline text-xl text-dark">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/upload">
            <Button className="gap-2 bg-gold text-dark hover:bg-gold-light">
              <PlusCircle className="size-4" />
              Upload New Property
            </Button>
          </Link>
          <Link href="/dashboard/properties">
            <Button variant="outline" className="gap-2">
              <Building2 className="size-4" />
              View My Listings
            </Button>
          </Link>
          {!stats.isSubscriber && (
            <Link href="/pricing">
              <Button variant="outline" className="gap-2 border-gold text-gold hover:bg-gold/10">
                Upgrade Plan
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
