'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDate, formatDateTime, formatIndianPrice } from '@/lib/format'
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
  const [extendDate, setExtendDate] = useState('')

  const handleExtend = async (id: string) => {
    if (!extendDate) {
      toast.error('Select a valid date')
      return
    }
    try {
      const res = await apiFetch(`/api/admin/subscriptions/${id}/extend`, {
        method: 'PATCH',
        body: JSON.stringify({ newExpiryDate: extendDate }),
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Extend failed')
      }
      toast.success(`Expiry date updated`)
      setExtendId(null)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Extend failed')
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
                {formatDateTime(sub.expiryDate)}
              </td>
              <td className="p-4">
                <StatusBadge status={sub.status} />
              </td>
              <td className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  {extendId === sub.id ? (
                    <>
                      <Input
                        type="date"
                        className="h-8 w-36"
                        value={extendDate}
                        onChange={(e) => setExtendDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
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
                            onClick={() => {
                              setExtendId(sub.id)
                              const d = new Date(sub.expiryDate)
                              setExtendDate(d.toISOString().split('T')[0])
                            }}
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
