import { getAdminStats } from '@/lib/admin'
import { AdminDashboard } from '@/components/admin/AdminDashboard'

export default async function AdminPage() {
  const stats = await getAdminStats()
  return <AdminDashboard stats={stats} />
}
