import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'

export const metadata = {
  title: 'My Leads | Xcity RealEstate',
}

export default async function LeadsPage() {
  const session = await requireAuth()

  const leads = await prisma.lead.findMany({
    where: { ownerId: session.userId },
    include: {
      property: { select: { title: true, slug: true } },
      buyer: { select: { name: true, phone: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl text-dark">My Leads</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-cream-dark">
        {leads.length === 0 ? (
          <div className="p-8 text-center text-neutral">
            No leads yet. When someone sends an inquiry about your property, it will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body text-sm">
              <thead className="bg-cream-dark/50 text-dark">
                <tr>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Property</th>
                  <th className="p-4 font-semibold">Inquirer</th>
                  <th className="p-4 font-semibold">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-dark">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-cream/20 transition-colors">
                    <td className="p-4 whitespace-nowrap text-neutral">
                      {format(new Date(lead.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="p-4 font-medium text-dark">
                      <a href={`/properties/${lead.property.slug}`} className="hover:text-gold transition-colors" target="_blank" rel="noopener noreferrer">
                        {lead.property.title}
                      </a>
                    </td>
                    <td className="p-4">
                      <div>{lead.buyer.name || 'Unknown'}</div>
                      <div className="font-mono text-xs text-neutral">{lead.buyer.phone}</div>
                    </td>
                    <td className="p-4 text-dark/80 max-w-md truncate" title={lead.message}>
                      {lead.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
