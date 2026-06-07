'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/format'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { apiFetch } from '@/lib/api-client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface UserRow {
  id: string
  phone: string
  name: string | null
  role: string
  status: string
  createdAt: Date
  subscriptions: { planType: string }[]
  _count: { properties: number }
}

export function AdminUsersTable({
  initialUsers,
  total,
  page,
  totalPages,
}: {
  initialUsers: UserRow[]
  total: number
  page: number
  totalPages: number
}) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const updateFilters = (p: number) => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (roleFilter !== 'ALL') params.set('role', roleFilter)
    if (statusFilter !== 'ALL') params.set('status', statusFilter)
    params.set('page', String(p))
    router.push(`/admin/users?${params.toString()}`)
  }

  const handleBan = async (id: string, ban: boolean) => {
    try {
      const res = await apiFetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: ban ? 'BANNED' : 'ACTIVE' }),
      })
      if (!res.ok) throw new Error()
      toast.success(ban ? 'User banned' : 'User unbanned')
      router.refresh()
    } catch {
      toast.error('Action failed')
    }
  }

  const roleBadge = (role: string) => {
    const styles: Record<string, string> = {
      ADMIN: 'bg-gold text-dark',
      SUBSCRIBER: 'bg-success text-white',
      USER: 'bg-cream-dark text-dark',
    }
    return (
      <span className={cn('rounded px-2 py-0.5 font-mono text-xs', styles[role] ?? '')}>
        {role}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-2xl text-dark">Users</h1>
          <p className="font-body text-neutral">{total} users total</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search phone or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64"
        />
        {(['ALL', 'USER', 'SUBSCRIBER', 'ADMIN'] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRoleFilter(r)}
            className={cn(
              'rounded-full px-3 py-1 text-sm',
              roleFilter === r ? 'bg-gold text-dark' : 'bg-white text-neutral'
            )}
          >
            {r}
          </button>
        ))}
        {(['ALL', 'ACTIVE', 'BANNED'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={cn(
              'rounded-full px-3 py-1 text-sm',
              statusFilter === s ? 'bg-dark text-cream' : 'bg-white text-neutral'
            )}
          >
            {s}
          </button>
        ))}
        <Button variant="outline" onClick={() => updateFilters(1)}>
          Apply
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-cream-dark text-left">
              <th className="p-4 text-sm text-neutral">#</th>
              <th className="p-4 text-sm text-neutral">Phone</th>
              <th className="p-4 text-sm text-neutral">Name</th>
              <th className="p-4 text-sm text-neutral">Role</th>
              <th className="p-4 text-sm text-neutral">Status</th>
              <th className="p-4 text-sm text-neutral">Joined</th>
              <th className="p-4 text-sm text-neutral">Subscription</th>
              <th className="p-4 text-sm text-neutral">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialUsers.map((user, i) => (
              <tr key={user.id} className="border-b border-cream-dark/50">
                <td className="p-4 font-mono text-sm">{(page - 1) * 20 + i + 1}</td>
                <td className="p-4 font-mono text-sm">{user.phone}</td>
                <td className="p-4">{user.name ?? '—'}</td>
                <td className="p-4">{roleBadge(user.role)}</td>
                <td className="p-4">
                  <StatusBadge status={user.status} />
                </td>
                <td className="p-4 font-mono text-sm">{formatDate(user.createdAt)}</td>
                <td className="p-4 text-sm">
                  {user.subscriptions[0]?.planType ?? '—'}
                </td>
                <td className="p-4">
                  <button
                    type="button"
                    onClick={() => handleBan(user.id, user.status !== 'BANNED')}
                    className="text-sm text-error hover:underline"
                  >
                    {user.status === 'BANNED' ? 'Unban' : 'Ban'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => updateFilters(p)}
              className={cn(
                'rounded px-3 py-1 font-mono text-sm',
                p === page ? 'bg-gold text-dark' : 'bg-white'
              )}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
