'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Download, Copy } from 'lucide-react'
import { formatDate, formatIndianPrice } from '@/lib/format'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface PaymentRow {
  id: string
  createdAt: string
  transactionId: string
  paymentType: string
  planType: string | null
  amount: number
  status: string
  invoiceUrl: string | null
  user: { phone: string }
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [status, setStatus] = useState('ALL')
  const [type, setType] = useState('ALL')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/admin/payments?' + new URLSearchParams({ limit: '50' }))
      .then((r) => r.json())
      .then((d) => setPayments(d.payments ?? []))
      .catch(() => {})
  }, [])

  const exportCsv = () => {
    const params = new URLSearchParams()
    if (status !== 'ALL') params.set('status', status)
    if (type !== 'ALL') params.set('type', type)
    if (search) params.set('search', search)
    window.open(`/api/admin/payments/export?${params.toString()}`, '_blank')
  }

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id)
    toast.success('Copied')
  }

  const filtered = payments.filter((p) => {
    if (status !== 'ALL' && p.status !== status) return false
    if (type !== 'ALL' && p.paymentType !== type) return false
    if (search && !p.transactionId.includes(search)) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-2xl text-dark">Payments</h1>
        <Button variant="outline" onClick={exportCsv} className="gap-2">
          <Download className="size-4" /> Export CSV
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Transaction ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        {['ALL', 'SUCCESS', 'FAILED', 'PENDING', 'REFUNDED'].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={`rounded-full px-3 py-1 text-sm ${status === s ? 'bg-gold text-dark' : 'bg-white'}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-cream-dark text-left text-sm text-neutral">
              <th className="p-4">Date</th>
              <th className="p-4">Transaction ID</th>
              <th className="p-4">User</th>
              <th className="p-4">Type</th>
              <th className="p-4">Plan</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4">Invoice</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-cream-dark/50">
                <td className="p-4 font-mono text-sm">{formatDate(p.createdAt)}</td>
                <td className="p-4">
                  <button
                    type="button"
                    className="group flex items-center gap-1 font-mono text-sm"
                    onClick={() => copyId(p.transactionId)}
                  >
                    {p.transactionId.slice(0, 16)}...
                    <Copy className="size-3 opacity-0 group-hover:opacity-100" />
                  </button>
                </td>
                <td className="p-4 font-mono text-sm">{p.user.phone}</td>
                <td className="p-4 text-sm">{p.paymentType}</td>
                <td className="p-4 text-sm">{p.planType ?? '—'}</td>
                <td className="p-4 font-mono text-sm">{formatIndianPrice(p.amount)}</td>
                <td className="p-4">
                  <StatusBadge status={p.status} />
                </td>
                <td className="p-4">
                  {p.invoiceUrl ? (
                    <Link href={p.invoiceUrl} target="_blank" className="text-sm text-gold hover:underline">
                      Download
                    </Link>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
