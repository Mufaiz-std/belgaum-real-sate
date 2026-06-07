import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getDashboardUser, getTokenUsageToday } from '@/lib/dashboard'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { BottomNav } from '@/components/dashboard/BottomNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session) redirect('/login')

  const user = await getDashboardUser(session.userId)
  if (!user) redirect('/login')

  const tokensToday = await getTokenUsageToday(session.userId)
  const isSubscriber = user.subscriptions.length > 0

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar
        phone={user.phone}
        role={user.role}
        tokensToday={tokensToday}
        isSubscriber={isSubscriber}
      />
      <main className="flex-1 pb-20 md:pb-8">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
      </main>
      <BottomNav />
    </div>
  )
}
