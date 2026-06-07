import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatDate, formatIndianPrice } from '@/lib/format'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { redirect } from 'next/navigation'
import { Download } from 'lucide-react'
import Link from 'next/link'

export default async function PaymentsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const payments = await prisma.payment.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-2xl text-dark">Payment History</h1>
        <p className="mt-1 font-body text-neutral">View all your transactions</p>
      </div>

      {payments.length > 0 ? (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-cream-dark text-left">
                <th className="p-4 font-body text-sm font-medium text-neutral">Date</th>
                <th className="p-4 font-body text-sm font-medium text-neutral">Transaction ID</th>
                <th className="p-4 font-body text-sm font-medium text-neutral">Plan/Property</th>
                <th className="p-4 font-body text-sm font-medium text-neutral">Amount</th>
                <th className="p-4 font-body text-sm font-medium text-neutral">Status</th>
                <th className="p-4 font-body text-sm font-medium text-neutral">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b border-cream-dark/50 last:border-0">
                  <td className="p-4 font-mono text-sm text-neutral">
                    {formatDate(payment.createdAt)}
                  </td>
                  <td className="p-4 font-mono text-sm text-dark">
                    {payment.transactionId}
                  </td>
                  <td className="p-4 font-body text-sm text-dark">
                    {payment.paymentType === 'SUBSCRIPTION'
                      ? `${payment.planType ?? 'Plan'} Subscription`
                      : 'Single Property Unlock'}
                  </td>
                  <td className="p-4 font-mono text-sm font-medium text-dark">
                    {formatIndianPrice(payment.amount)}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={payment.status} />
                  </td>
                  <td className="p-4">
                    {payment.invoiceUrl ? (
                      <Link
                        href={payment.invoiceUrl}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-sm text-gold hover:underline"
                      >
                        <Download className="size-4" />
                        Download
                      </Link>
                    ) : (
                      <span className="text-sm text-neutral">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm">
          <p className="font-body text-neutral">No payment history yet.</p>
        </div>
      )}
    </div>
  )
}
