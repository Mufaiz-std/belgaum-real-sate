'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDate, formatIndianPrice } from '@/lib/format'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiFetch } from '@/lib/api-client'
import { toast } from 'sonner'

interface SubscriptionRow {
  id: string
  planType: string
  amount: number
  startDate: Date
  expiryDate: Date
  status: string
  user: { phone: string; id: string }
}

export function AdminSubscriptionsTable({
  subscriptions,
}: {
  subscriptions: SubscriptionRow[]
}) {
  const router = useRouter()
  const [extendId, setExtendId] = useState<string | null>(null)
  const [extendDays, setExtendDays] = useState('30')

  const handleExtend = async (id: string) => {
    const days = parseInt(extendDays, 10)
    if (!days || days < 1) {
      toast.error('Enter valid days')
      return
    }
    try {
      const res = await apiFetch(`/api/admin/subscriptions/${id}/extend`, {
        method: 'PATCH',
        body: JSON.stringify({ days }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Extended by ${days} days`)
      setExtendId(null)
      router.refresh()
    } catch {
      toast.error('Extend failed')
    }
  }

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this subscription?')) return
    try {
      const res = await apiFetch(`/api/admin/subscriptions/${id}/cancel`, {
        method: 'PATCH',
      })
      if (!res.ok) throw new Error()
      toast.success('Subscription cancelled')
      router.refresh()
    } catch {
      toast.error('Cancel failed')
    }
  }

  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="border-b border-cream-dark text-left text-sm text-neutral">
            <th className="p-4">User Phone</th>
            <th className="p-4">Plan</th>
            <th className="p-4">Amount</th>
            <th className="p-4">Start</th>
            <th className="p-4">Expiry</th>
            <th className="p-4">Status</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.map((sub) => (
            <tr key={sub.id} className="border-b border-cream-dark/50">
              <td className="p-4 font-mono text-sm">{sub.user.phone}</td>
              <td className="p-4">{sub.planType}</td>
              <td className="p-4 font-mono text-sm">
                {formatIndianPrice(sub.amount)}
              </td>
              <td className="p-4 font-mono text-sm">
                {formatDate(sub.startDate)}
              </td>
              <td className="p-4 font-mono text-sm">
                {formatDate(sub.expiryDate)}
              </td>
              <td className="p-4">
                <StatusBadge status={sub.status} />
              </td>
              <td className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  {extendId === sub.id ? (
                    <>
                      <Input
                        type="number"
                        className="h-8 w-20"
                        value={extendDays}
                        onChange={(e) => setExtendDays(e.target.value)}
                        min={1}
                        max={365}
                      />
                      <Button size="sm" onClick={() => handleExtend(sub.id)}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setExtendId(null)}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      {sub.status === 'ACTIVE' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setExtendId(sub.id)}
                          >
                            Extend
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCancel(sub.id)}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                      <Link
                        href={`/admin/users?search=${encodeURIComponent(sub.user.phone)}`}
                        className="text-sm text-gold hover:underline"
                      >
                        View User
                      </Link>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
