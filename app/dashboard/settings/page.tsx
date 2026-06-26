import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SettingsForm } from '@/components/dashboard/SettingsForm'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  })

  if (!user) redirect('/login')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-2xl text-dark">Settings</h1>
        <p className="mt-1 font-body text-neutral">Manage your account preferences</p>
      </div>

      {/* Subscription Settings Card */}
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-cream-dark">
        <h2 className="font-headline text-xl text-dark mb-2">Subscription Settings</h2>
        <p className="font-body text-neutral text-sm mb-4">
          View your current plan, tokens usage, and subscription history.
        </p>
        <a href="/dashboard/subscription" className="inline-flex items-center justify-center rounded-xl bg-gold px-4 py-2 font-body font-bold text-dark hover:bg-gold-light transition-colors">
          Manage Subscription
        </a>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm border border-cream-dark">
        <h2 className="font-headline text-xl text-dark mb-4">Profile Settings</h2>
        <SettingsForm
          phone={user.phone}
          initialData={{
            name: user.name,
            email: user.email,
          }}
        />
      </div>
    </div>
  )
}
