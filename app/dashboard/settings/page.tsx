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

      <SettingsForm
        phone={user.phone}
        initialData={{
          name: user.name,
          email: user.email,
        }}
      />
    </div>
  )
}
