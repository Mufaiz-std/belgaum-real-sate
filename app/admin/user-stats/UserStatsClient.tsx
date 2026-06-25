'use client'

import { useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronDown, ExternalLink, Search, BarChart3, CreditCard, Building2, Unlock, MessageCircle, Bookmark, PhoneCall } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatDate, formatIndianPrice, maskPhone } from '@/lib/format'
import { Role } from '@prisma/client'

// Replace with proper type from Prisma in production
type UserWithStats = any

interface Props {
  initialUsers: UserWithStats[]
  total: number
  page: number
  totalPages: number
}

export function UserStatsClient({ initialUsers, total, page, totalPages }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') ?? '')
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim())
    } else {
      params.delete('search')
    }
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`)
  }

  const toggleExpand = (userId: string) => {
    setExpandedUserId(expandedUserId === userId ? null : userId)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl text-dark">User Statistics</h1>
          <p className="font-body text-sm text-neutral mt-1">
            Detailed insights and property interaction history per user
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral" />
            <Input
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" className="bg-gold text-dark hover:bg-gold-light">
            Search
          </Button>
        </form>
      </div>

      <div className="space-y-4">
        {initialUsers.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm">
            <BarChart3 className="mx-auto size-12 text-cream-dark" />
            <h3 className="mt-4 font-headline text-lg text-dark">No users found</h3>
            <p className="font-body text-sm text-neutral">Try adjusting your search filters.</p>
          </div>
        ) : (
          initialUsers.map((user) => {
            const activeSub = user.subscriptions[0]
            const creditsUsed = user.dailyUsage[0]?.viewsUsed || 0
            const creditLimit = activeSub?.dailyLimit || 0

            return (
              <div key={user.id} className="rounded-xl bg-white shadow-sm overflow-hidden">
                {/* Header / Summary Row */}
                <div 
                  className="flex items-center justify-between p-5 cursor-pointer hover:bg-cream/5 transition-colors"
                  onClick={() => toggleExpand(user.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold">
                      {(user.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-headline text-lg text-dark">{user.name || 'Unnamed User'}</h3>
                      <div className="flex items-center gap-3 font-mono text-xs text-neutral">
                        <span>{user.phone}</span>
                        <span className={cn("px-2 py-0.5 rounded-full font-bold", 
                          user.role === 'ADMIN' ? 'bg-error/20 text-error' :
                          user.role === 'SUBSCRIBER' ? 'bg-success/20 text-success' : 'bg-cream-dark text-dark/70'
                        )}>
                          {user.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="hidden md:flex gap-6 text-center">
                      <div>
                        <p className="font-mono text-lg font-bold text-dark">{user.properties.length}</p>
                        <p className="font-body text-[10px] text-neutral uppercase">Uploads</p>
                      </div>
                      <div>
                        <p className="font-mono text-lg font-bold text-dark">{user.unlocks.length}</p>
                        <p className="font-body text-[10px] text-neutral uppercase">Unlocked</p>
                      </div>
                      <div>
                        <p className="font-mono text-lg font-bold text-dark">{user.leadsAsBuyer.length}</p>
                        <p className="font-body text-[10px] text-neutral uppercase">Contacted</p>
                      </div>
                    </div>
                    <ChevronDown className={cn("size-5 text-neutral transition-transform", expandedUserId === user.id && "rotate-180")} />
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedUserId === user.id && (
                  <div className="border-t border-cream-dark bg-cream/10 p-6 space-y-8">
                    
                    {/* Subscriber Credits Section */}
                    {activeSub && (
                      <div className="bg-white rounded-lg p-4 border border-gold/30 flex items-center justify-between">
                        <div>
                          <p className="font-headline font-semibold text-dark">Active Subscription ({activeSub.planType})</p>
                          <p className="font-body text-xs text-neutral">Expires {formatDate(activeSub.expiryDate)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-lg font-bold text-dark">{creditsUsed} / {creditLimit}</p>
                          <p className="font-body text-xs text-neutral uppercase">Credits Used Today</p>
                        </div>
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Left Column */}
                      <div className="space-y-8">
                        
                        {/* Properties Uploaded */}
                        <section>
                          <h4 className="flex items-center gap-2 font-headline font-semibold text-dark border-b border-cream-dark pb-2 mb-3">
                            <Building2 className="size-4 text-gold" />
                            Properties Uploaded ({user.properties.length})
                          </h4>
                          {user.properties.length === 0 ? (
                            <p className="text-sm text-neutral italic">No properties uploaded.</p>
                          ) : (
                            <ul className="space-y-2">
                              {user.properties.map((p: any) => (
                                <li key={p.id} className="flex items-center justify-between bg-white px-3 py-2 rounded border border-cream-dark/50">
                                  <span className="font-body text-sm truncate max-w-[200px]">{p.title}</span>
                                  <div className="flex items-center gap-2">
                                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-mono font-bold", 
                                      p.status === 'ACTIVE' ? 'bg-success/20 text-success' : 'bg-neutral/20 text-neutral'
                                    )}>{p.status}</span>
                                    <Link href={`/properties/${p.slug}`} target="_blank" className="text-gold hover:text-gold-light">
                                      <ExternalLink className="size-4" />
                                    </Link>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </section>

                        {/* Payments Made */}
                        <section>
                          <h4 className="flex items-center gap-2 font-headline font-semibold text-dark border-b border-cream-dark pb-2 mb-3">
                            <CreditCard className="size-4 text-gold" />
                            Payments Made ({user.payments.length})
                          </h4>
                          {user.payments.length === 0 ? (
                            <p className="text-sm text-neutral italic">No successful payments.</p>
                          ) : (
                            <ul className="space-y-2">
                              {user.payments.map((pay: any) => (
                                <li key={pay.id} className="flex items-center justify-between bg-white px-3 py-2 rounded border border-cream-dark/50">
                                  <div>
                                    <p className="font-body text-sm font-medium">{pay.paymentType === 'SUBSCRIPTION' ? `Plan: ${pay.planType}` : 'Single Property'}</p>
                                    <p className="font-mono text-[10px] text-neutral">{formatDate(pay.createdAt)}</p>
                                  </div>
                                  <span className="font-mono text-sm font-bold text-success">
                                    {formatIndianPrice(pay.amount)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </section>

                      </div>

                      {/* Right Column */}
                      <div className="space-y-8">
                        
                        {/* Properties Unlocked */}
                        <section>
                          <h4 className="flex items-center gap-2 font-headline font-semibold text-dark border-b border-cream-dark pb-2 mb-3">
                            <Unlock className="size-4 text-gold" />
                            Properties Unlocked ({user.unlocks.length})
                          </h4>
                          {user.unlocks.length === 0 ? (
                            <p className="text-sm text-neutral italic">No properties unlocked.</p>
                          ) : (
                            <ul className="space-y-2">
                              {user.unlocks.map((u: any) => (
                                <li key={u.id} className="flex items-center justify-between bg-white px-3 py-2 rounded border border-cream-dark/50">
                                  <span className="font-body text-sm truncate max-w-[250px]">{u.property.title}</span>
                                  <Link href={`/properties/${u.property.slug}`} target="_blank" className="text-gold hover:text-gold-light">
                                    <ExternalLink className="size-4" />
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </section>

                        {/* Owners Contacted */}
                        <section>
                          <h4 className="flex items-center gap-2 font-headline font-semibold text-dark border-b border-cream-dark pb-2 mb-3">
                            <PhoneCall className="size-4 text-gold" />
                            Owners Contacted ({user.leadsAsBuyer.length})
                          </h4>
                          {user.leadsAsBuyer.length === 0 ? (
                            <p className="text-sm text-neutral italic">No owners contacted.</p>
                          ) : (
                            <ul className="space-y-2">
                              {user.leadsAsBuyer.map((lead: any) => (
                                <li key={lead.id} className="flex items-center justify-between bg-white px-3 py-2 rounded border border-cream-dark/50">
                                  <span className="font-body text-sm truncate max-w-[250px]">{lead.property.title}</span>
                                  <Link href={`/properties/${lead.property.slug}`} target="_blank" className="text-gold hover:text-gold-light">
                                    <ExternalLink className="size-4" />
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </section>

                        {/* Saved Properties */}
                        <section>
                          <h4 className="flex items-center gap-2 font-headline font-semibold text-dark border-b border-cream-dark pb-2 mb-3">
                            <Bookmark className="size-4 text-gold" />
                            Saved/Visited Properties ({user.savedProperties.length})
                          </h4>
                          {user.savedProperties.length === 0 ? (
                            <p className="text-sm text-neutral italic">No saved properties.</p>
                          ) : (
                            <ul className="space-y-2">
                              {user.savedProperties.map((s: any) => (
                                <li key={s.id} className="flex items-center justify-between bg-white px-3 py-2 rounded border border-cream-dark/50">
                                  <span className="font-body text-sm truncate max-w-[250px]">{s.property.title}</span>
                                  <Link href={`/properties/${s.property.slug}`} target="_blank" className="text-gold hover:text-gold-light">
                                    <ExternalLink className="size-4" />
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </section>

                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => {
              const params = new URLSearchParams(searchParams)
              params.set('page', (page - 1).toString())
              router.push(`${pathname}?${params.toString()}`)
            }}
          >
            Previous
          </Button>
          <span className="font-mono text-sm text-neutral">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => {
              const params = new URLSearchParams(searchParams)
              params.set('page', (page + 1).toString())
              router.push(`${pathname}?${params.toString()}`)
            }}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
