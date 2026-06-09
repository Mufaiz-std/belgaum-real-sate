import { getSession } from '@/lib/auth'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminSettingsClient from './AdminSettingsClient'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const session = await requireAdmin()

  const [user, areas, propertyTypes, plans] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { name: true, email: true, phone: true },
    }),
    prisma.area.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.propertyTypeConfig.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.planConfig.findMany({ orderBy: { price: 'asc' } }),
  ])

  if (!user) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-2xl text-dark">Settings</h1>
        <p className="mt-1 font-body text-neutral">
          Manage your platform preferences and configurations
        </p>
      </div>

      <AdminSettingsClient
        phone={user.phone}
        initialName={user.name}
        initialEmail={user.email}
        initialAreas={areas}
        initialPropertyTypes={propertyTypes}
        initialPlans={plans}
      />
    </div>
  )
}
