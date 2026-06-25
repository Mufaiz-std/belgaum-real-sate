'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDate, formatIndianPrice } from '@/lib/format'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { apiFetch } from '@/lib/api-client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface UserRow {
  id: string
  phone: string
  name: string | null
  role: string
  status: string
  createdAt: Date
  subscriptions: { planType: string; expiryDate: Date; status: string }[]
  _count: { properties: number }
}

interface PlanConfig {
  id: string
  planKey: string
  name: string
  duration: string
  price: number
  dailyLimit: number
}

export function AdminUsersTable({
  initialUsers,
  total,
  page,
  totalPages,
  planConfigs,
}: {
  initialUsers: UserRow[]
  total: number
  page: number
  totalPages: number
  planConfigs: PlanConfig[]
}) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Promote modal state
  const [promoteUser, setPromoteUser] = useState<UserRow | null>(null)
  const [selectedPlan, setSelectedPlan] = useState(planConfigs[0]?.planKey ?? 'BASIC')
  const [promoting, setPromoting] = useState(false)

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

  const handlePromote = async () => {
    if (!promoteUser) return
    setPromoting(true)
    try {
      const res = await apiFetch('/api/admin/subscriptions/grant', {
        method: 'POST',
        body: JSON.stringify({ userId: promoteUser.id, planType: selectedPlan }),
      })
      if (!res.ok) throw new Error()
      toast.success(`${promoteUser.name ?? promoteUser.phone} promoted to SUBSCRIBER with ${selectedPlan} plan`)
      setPromoteUser(null)
      router.refresh()
    } catch {
      toast.error('Promotion failed')
    } finally {
      setPromoting(false)
    }
  }

  const handleDemote = async (user: UserRow) => {
    if (!confirm(`Demote ${user.name ?? user.phone} to USER? Their active subscription will be cancelled.`)) return
    try {
      const res = await apiFetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ role: 'USER' }),
      })
      if (!res.ok) throw new Error()
      toast.success('User demoted to USER')
      router.refresh()
    } catch {
      toast.error('Demotion failed')
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
            {initialUsers.map((user, i) => {
              const activeSub = user.subscriptions.find((s) => s.status === 'ACTIVE')
              return (
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
                    {activeSub ? (
                      <div className="space-y-0.5">
                        <p className="font-mono text-xs font-semibold text-success">{activeSub.planType}</p>
                        <p className="font-mono text-[11px] text-neutral">
                          Until {formatDate(activeSub.expiryDate)}
                        </p>
                        <Link
                          href="/admin/subscriptions"
                          className="font-mono text-[10px] text-gold hover:underline"
                        >
                          Manage →
                        </Link>
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-3">
                      {user.role !== 'ADMIN' && (
                        <button
                          type="button"
                          title={
                            user.role === 'SUBSCRIBER'
                              ? 'Demote: Remove subscriber privileges and revert this user to a regular USER'
                              : 'Promote: Grant this user SUBSCRIBER access — you will choose a plan'
                          }
                          onClick={() => {
                            if (user.role === 'SUBSCRIBER') {
                              handleDemote(user)
                            } else {
                              setSelectedPlan(planConfigs[0]?.planKey ?? 'BASIC')
                              setPromoteUser(user)
                            }
                          }}
                          className="text-sm text-gold hover:underline"
                        >
                          {user.role === 'SUBSCRIBER' ? 'Demote' : 'Promote'}
                        </button>
                      )}
                      <button
                        type="button"
                        title={
                          user.status === 'BANNED'
                            ? "Unban: Restore this user's access to the platform"
                            : 'Ban: Block this user from accessing the platform'
                        }
                        onClick={() => handleBan(user.id, user.status !== 'BANNED')}
                        className="text-sm text-error hover:underline"
                      >
                        {user.status === 'BANNED' ? 'Unban' : 'Ban'}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
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

      {/* Promote Modal */}
      {promoteUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setPromoteUser(null)}
              className="absolute right-4 top-4 rounded-full p-1 text-neutral hover:bg-cream"
            >
              <X className="size-5" />
            </button>

            <h2 className="font-headline text-2xl text-dark">Promote to Subscriber</h2>
            <p className="mt-1 font-body text-sm text-neutral">
              Granting access to{' '}
              <span className="font-semibold text-dark">
                {promoteUser.name ?? promoteUser.phone}
              </span>
            </p>

            <p className="mt-6 mb-3 font-body text-sm font-medium text-dark">Select a plan:</p>
            <div className="space-y-3">
              {planConfigs.map((plan) => (
                <button
                  key={plan.planKey}
                  type="button"
                  onClick={() => setSelectedPlan(plan.planKey)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl border-2 px-5 py-4 text-left transition-all',
                    selectedPlan === plan.planKey
                      ? 'border-gold bg-gold/5'
                      : 'border-cream-dark hover:border-gold/50'
                  )}
                >
                  <div>
                    <p className="font-headline font-semibold text-dark">{plan.name}</p>
                    <p className="font-body text-sm text-neutral">{plan.duration}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-gold">{formatIndianPrice(plan.price)}</p>
                    <p className="font-mono text-xs text-neutral">Admin grant</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setPromoteUser(null)}
                disabled={promoting}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gold text-dark hover:bg-gold/90"
                onClick={handlePromote}
                disabled={promoting}
              >
                {promoting ? 'Promoting…' : 'Confirm Promote'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
