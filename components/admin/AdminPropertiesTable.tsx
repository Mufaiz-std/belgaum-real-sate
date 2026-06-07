'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Eye, Star, Trash2 } from 'lucide-react'
import { formatDate, formatIndianPrice } from '@/lib/format'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { Input } from '@/components/ui/input'
import { apiFetch } from '@/lib/api-client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const TABS = ['ALL', 'PENDING', 'ACTIVE', 'SOLD', 'REJECTED', 'EXPIRED'] as const

interface PropertyRow {
  id: string
  slug: string
  title: string
  area: string
  propertyType: string
  priceMin: number
  status: string
  viewCount: number
  isFeatured: boolean
  createdAt: Date
  owner: { phone: string }
  images: { imageUrl: string }[]
}

export function AdminPropertiesTable({
  properties: initial,
  currentTab,
  search,
}: {
  properties: PropertyRow[]
  currentTab: string
  search: string
}) {
  const router = useRouter()
  const [properties, setProperties] = useState(initial)
  const [selected, setSelected] = useState<string[]>([])
  const [searchVal, setSearchVal] = useState(search)
  const [drawerId, setDrawerId] = useState<string | null>(null)
  const [drawerData, setDrawerData] = useState<Record<string, unknown> | null>(null)

  const updateTab = (tab: string) => {
    const params = new URLSearchParams()
    if (tab !== 'ALL') params.set('status', tab)
    if (searchVal) params.set('search', searchVal)
    router.push(`/admin/properties?${params.toString()}`)
  }

  const handleAction = async (id: string, action: string, extra?: Record<string, unknown>) => {
    try {
      if (action === 'approve') {
        await apiFetch(`/api/admin/properties/${id}/approve`, { method: 'POST' })
      } else if (action === 'reject') {
        await apiFetch(`/api/admin/properties/${id}/reject`, {
          method: 'POST',
          body: JSON.stringify({ reason: extra?.reason ?? 'Rejected by admin' }),
        })
      } else if (action === 'delete') {
        await apiFetch(`/api/admin/properties/${id}`, { method: 'DELETE' })
      } else if (action === 'sold' || action === 'feature') {
        await apiFetch(`/api/admin/properties/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(
            action === 'sold' ? { status: 'SOLD' } : { isFeatured: !extra?.isFeatured }
          ),
        })
      }
      setProperties((p) => p.filter((x) => !['approve', 'reject', 'delete'].includes(action) || x.id !== id))
      toast.success('Updated')
      router.refresh()
    } catch {
      toast.error('Action failed')
    }
  }

  const openDrawer = async (id: string) => {
    setDrawerId(id)
    const res = await apiFetch(`/api/admin/properties/${id}`)
    const data = await res.json()
    setDrawerData(data.property)
  }

  const toggleSelect = (id: string) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }

  const bulkAction = async (action: 'approve' | 'reject' | 'delete') => {
    await apiFetch('/api/admin/properties/bulk', {
      method: 'POST',
      body: JSON.stringify({ ids: selected, action }),
    })
    setProperties((p) => p.filter((x) => !selected.includes(x.id)))
    setSelected([])
    toast.success(`Bulk ${action} complete`)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-2xl text-dark">Properties</h1>

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => updateTab(tab)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm',
              currentTab === tab ? 'bg-gold text-dark' : 'bg-white text-neutral'
            )}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          updateTab(currentTab)
        }}
        className="flex gap-2"
      >
        <Input
          placeholder="Search title or area..."
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          className="max-w-xs"
        />
      </form>

      {selected.length > 0 && (
        <div className="flex items-center gap-4 rounded-lg bg-cream-dark px-4 py-2">
          <span className="text-sm">Selected {selected.length}</span>
          <button type="button" className="text-sm text-success" onClick={() => bulkAction('approve')}>
            Approve All
          </button>
          <button type="button" className="text-sm text-error" onClick={() => bulkAction('reject')}>
            Reject All
          </button>
          <button type="button" className="text-sm text-error" onClick={() => bulkAction('delete')}>
            Delete All
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full min-w-[1100px]">
          <thead>
            <tr className="border-b border-cream-dark text-left text-sm text-neutral">
              <th className="p-3 w-8" />
              <th className="p-3">Thumbnail</th>
              <th className="p-3">Title</th>
              <th className="p-3">Owner</th>
              <th className="p-3">Area</th>
              <th className="p-3">Type</th>
              <th className="p-3">Price</th>
              <th className="p-3">Status</th>
              <th className="p-3">Views</th>
              <th className="p-3">Date</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {properties.map((p) => (
                <motion.tr
                  key={p.id}
                  exit={{ opacity: 0, x: -20 }}
                  className="border-b border-cream-dark/50"
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(p.id)}
                      onChange={() => toggleSelect(p.id)}
                    />
                  </td>
                  <td className="p-3">
                    <div className="relative size-12 rounded-lg bg-cream-dark overflow-hidden">
                      {p.images[0] && (
                        <Image src={p.images[0].imageUrl} alt="" fill className="object-cover" />
                      )}
                    </div>
                  </td>
                  <td className="max-w-[160px] truncate p-3 font-medium">{p.title}</td>
                  <td className="p-3 font-mono text-xs">{p.owner.phone}</td>
                  <td className="p-3 text-sm">{p.area}</td>
                  <td className="p-3 text-sm">{p.propertyType}</td>
                  <td className="p-3 font-mono text-sm">{formatIndianPrice(p.priceMin)}</td>
                  <td className="p-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="p-3 font-mono text-sm">{p.viewCount}</td>
                  <td className="p-3 font-mono text-xs">{formatDate(p.createdAt)}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2 text-xs">
                      {p.status === 'PENDING' && (
                        <>
                          <button type="button" className="text-success" onClick={() => handleAction(p.id, 'approve')}>
                            <CheckCircle className="size-4" />
                          </button>
                          <button type="button" className="text-error" onClick={() => handleAction(p.id, 'reject')}>
                            <XCircle className="size-4" />
                          </button>
                        </>
                      )}
                      <button type="button" onClick={() => openDrawer(p.id)}>
                        <Eye className="size-4" />
                      </button>
                      {p.status === 'ACTIVE' && (
                        <button type="button" onClick={() => handleAction(p.id, 'sold')}>
                          Sold
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleAction(p.id, 'feature', { isFeatured: p.isFeatured })}
                      >
                        <Star className={cn('size-4', p.isFeatured && 'fill-gold text-gold')} />
                      </button>
                      <button type="button" className="text-error" onClick={() => handleAction(p.id, 'delete')}>
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {drawerId && drawerData && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-dark/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerId(null)}
            />
            <motion.div
              className="fixed right-0 top-0 z-50 h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-2xl"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
            >
              <h2 className="font-headline text-xl">{(drawerData as { title: string }).title}</h2>
              <pre className="mt-4 overflow-auto rounded bg-cream p-4 text-xs">
                {JSON.stringify(drawerData, null, 2)}
              </pre>
              <Link
                href={`/properties/${(drawerData as { slug: string }).slug}`}
                target="_blank"
                className="mt-4 block text-gold hover:underline"
              >
                Open public page
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
