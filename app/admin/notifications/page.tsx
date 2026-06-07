import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/format'
import { StatusBadge } from '@/components/dashboard/StatusBadge'

export default async function AdminNotificationsPage() {
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { user: { select: { phone: true, name: true } } },
  })

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-2xl text-dark">Notifications</h1>
      <p className="font-body text-neutral">System notifications sent to users</p>

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-cream-dark text-left text-sm text-neutral">
              <th className="p-4">Date</th>
              <th className="p-4">User</th>
              <th className="p-4">Title</th>
              <th className="p-4">Body</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((n) => (
              <tr key={n.id} className="border-b border-cream-dark/50">
                <td className="p-4 font-mono text-sm">{formatDate(n.createdAt)}</td>
                <td className="p-4 font-mono text-sm">{n.user.phone}</td>
                <td className="p-4 font-medium">{n.title}</td>
                <td className="max-w-[300px] truncate p-4 text-sm text-neutral">{n.body}</td>
                <td className="p-4">
                  <StatusBadge status={n.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
