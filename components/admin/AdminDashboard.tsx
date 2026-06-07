'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Building2, Star, TrendingUp, CheckCircle, XCircle, Eye } from 'lucide-react'
import { formatDate, formatIndianPrice } from '@/lib/format'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { Button } from '@/components/ui/button'
import { apiFetch } from '@/lib/api-client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface AdminDashboardProps {
  stats: {
    totalUsers: number
    usersThisWeek: number
    totalProperties: number
    activeSubscriptions: number
    pendingProperties: number
    revenue: { today: number; month: number; year: number }
    recentPayments: {
      id: string
      createdAt: Date
      amount: number
      paymentType: string
      planType: string | null
      status: string
      user: { phone: string }
    }[]
    pendingList: {
      id: string
      slug: string
      title: string
      area: string
      propertyType: string
      createdAt: Date
      owner: { phone: string; name: string | null }
      images: { imageUrl: string }[]
    }[]
  }
}

export function AdminDashboard({ stats: initialStats }: AdminDashboardProps) {
  const router = useRouter()
  const [pendingList, setPendingList] = useState(initialStats.pendingList)
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  const handleApprove = async (id: string) => {
    setLoading(id)
    try {
      const res = await apiFetch(`/api/admin/properties/${id}/approve`, { method: 'POST' })
      if (!res.ok) throw new Error()
      setPendingList((list) => list.filter((p) => p.id !== id))
      toast.success('Property approved')
      router.refresh()
    } catch {
      toast.error('Failed to approve')
    } finally {
      setLoading(null)
    }
  }

  const handleReject = async () => {
    if (!rejectId || !rejectReason.trim()) return
    setLoading(rejectId)
    try {
      const res = await apiFetch(`/api/admin/properties/${rejectId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason: rejectReason }),
      })
      if (!res.ok) throw new Error()
      setPendingList((list) => list.filter((p) => p.id !== rejectId))
      setRejectId(null)
      setRejectReason('')
      toast.success('Property rejected')
      router.refresh()
    } catch {
      toast.error('Failed to reject')
    } finally {
      setLoading(null)
    }
  }

  const statCards = [
    {
      label: 'Total Users',
      value: initialStats.totalUsers,
      sub: `↑ ${initialStats.usersThisWeek} this week`,
      icon: Users,
      color: 'text-blue-500',
      border: 'border-l-blue-500',
    },
    {
      label: 'Total Properties',
      value: initialStats.totalProperties,
      sub: `${initialStats.pendingProperties} pending`,
      icon: Building2,
      color: 'text-gold',
      border: 'border-l-gold',
    },
    {
      label: 'Active Subscriptions',
      value: initialStats.activeSubscriptions,
      sub: 'Currently active',
      icon: Star,
      color: 'text-success',
      border: 'border-l-success',
    },
    {
      label: 'Revenue (This Month)',
      value: formatIndianPrice(initialStats.revenue.month),
      sub: `Today: ${formatIndianPrice(initialStats.revenue.today)}`,
      icon: TrendingUp,
      color: 'text-purple-500',
      border: 'border-l-purple-500',
      isPrice: true,
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-2xl text-dark">Admin Dashboard</h1>
        <p className="mt-1 font-body text-neutral">Overview of platform activity</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className={`relative rounded-xl border-l-4 bg-white p-5 shadow-sm ${card.border}`}
            >
              <Icon className={`absolute right-4 top-4 size-5 ${card.color}`} />
              <p className={`font-mono text-3xl font-bold text-dark ${card.isPrice ? 'text-2xl' : ''}`}>
                {card.value}
              </p>
              <p className="mt-1 font-body text-sm text-neutral">{card.label}</p>
              <p className="mt-1 font-body text-xs text-neutral">{card.sub}</p>
            </div>
          )
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Today', value: initialStats.revenue.today },
          { label: 'This Month', value: initialStats.revenue.month },
          { label: 'This Year', value: initialStats.revenue.year },
        ].map((r) => (
          <div key={r.label} className="rounded-xl bg-white p-4 shadow-sm">
            <p className="font-body text-sm text-neutral">{r.label}</p>
            <p className="font-mono text-xl font-bold text-gold">
              {formatIndianPrice(r.value)}
            </p>
          </div>
        ))}
      </div>

      <div>
        <div className="mb-4 flex items-center gap-2">
          <h2 className="font-headline text-xl text-dark">Pending Approvals</h2>
          {pendingList.length > 0 && (
            <span className="rounded-full bg-error px-2 py-0.5 font-mono text-xs text-white">
              {pendingList.length}
            </span>
          )}
        </div>

        {pendingList.length > 0 ? (
          <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-cream-dark text-left">
                  <th className="p-4 text-sm text-neutral">Thumbnail</th>
                  <th className="p-4 text-sm text-neutral">Title</th>
                  <th className="p-4 text-sm text-neutral">Owner</th>
                  <th className="p-4 text-sm text-neutral">Area</th>
                  <th className="p-4 text-sm text-neutral">Type</th>
                  <th className="p-4 text-sm text-neutral">Submitted</th>
                  <th className="p-4 text-sm text-neutral">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {pendingList.map((property) => (
                    <motion.tr
                      key={property.id}
                      exit={{ opacity: 0, x: -20 }}
                      className="border-b border-cream-dark/50"
                    >
                      <td className="p-4">
                        <div className="relative size-12 overflow-hidden rounded-lg bg-cream-dark">
                          {property.images[0] && (
                            <Image
                              src={property.images[0].imageUrl}
                              alt=""
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-body font-medium">{property.title}</td>
                      <td className="p-4 font-mono text-sm">{property.owner.phone}</td>
                      <td className="p-4 font-mono text-sm">{property.area}</td>
                      <td className="p-4 text-sm">{property.propertyType}</td>
                      <td className="p-4 font-mono text-sm">{formatDate(property.createdAt)}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={loading === property.id}
                            onClick={() => handleApprove(property.id)}
                            className="flex items-center gap-1 text-sm text-success hover:underline"
                          >
                            <CheckCircle className="size-4" /> Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectId(property.id)}
                            className="flex items-center gap-1 text-sm text-error hover:underline"
                          >
                            <XCircle className="size-4" /> Reject
                          </button>
                          <Link
                            href={`/properties/${property.slug}`}
                            target="_blank"
                            className="flex items-center gap-1 text-sm text-neutral hover:underline"
                          >
                            <Eye className="size-4" /> View
                          </Link>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        ) : (
          <p className="font-body text-neutral">No pending approvals.</p>
        )}
      </div>

      <div>
        <h2 className="mb-4 font-headline text-xl text-dark">Recent Payments</h2>
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-cream-dark text-left">
                <th className="p-4 text-sm text-neutral">Date</th>
                <th className="p-4 text-sm text-neutral">User Phone</th>
                <th className="p-4 text-sm text-neutral">Plan/Property</th>
                <th className="p-4 text-sm text-neutral">Amount</th>
                <th className="p-4 text-sm text-neutral">Status</th>
              </tr>
            </thead>
            <tbody>
              {initialStats.recentPayments.map((payment) => (
                <tr key={payment.id} className="border-b border-cream-dark/50">
                  <td className="p-4 font-mono text-sm">{formatDate(payment.createdAt)}</td>
                  <td className="p-4 font-mono text-sm">{payment.user.phone}</td>
                  <td className="p-4 text-sm">
                    {payment.paymentType === 'SUBSCRIPTION'
                      ? payment.planType
                      : 'Single Property'}
                  </td>
                  <td className="p-4 font-mono text-sm">{formatIndianPrice(payment.amount)}</td>
                  <td className="p-4">
                    <StatusBadge status={payment.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!rejectId} onOpenChange={() => setRejectId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Property</DialogTitle>
            <DialogDescription>Provide a reason for the owner.</DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Rejection reason..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim()}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
