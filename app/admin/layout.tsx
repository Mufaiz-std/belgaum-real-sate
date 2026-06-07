import { requireAdmin } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const session = await requireAdmin()

    const [user, pendingCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.userId },
        select: { name: true, phone: true },
      }),
      prisma.property.count({ where: { status: 'PENDING' } }),
    ])

    if (!user) redirect('/login')

    return (
      <div className="flex h-screen overflow-hidden bg-cream">
        <AdminSidebar
          adminName={user.name}
          adminPhone={user.phone}
          pendingCount={pendingCount}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-6 lg:p-8">{children}</div>
        </main>
      </div>
    )
  } catch {
    redirect('/login')
  }
}
