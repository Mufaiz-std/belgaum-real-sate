'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import { PropertiesTable } from './PropertiesTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { deleteProperties } from '@/actions/property'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const STATUS_FILTERS = ['ALL', 'ACTIVE', 'PENDING', 'SOLD', 'REJECTED'] as const

interface PropertiesPageClientProps {
  properties: {
    id: string
    slug: string
    title: string
    area: string
    status: string
    coverImage?: string
  }[]
  total: number
  page: number
  totalPages: number
  currentStatus: string
  currentSearch: string
}

export function PropertiesPageClient({
  properties,
  total,
  page,
  totalPages,
  currentStatus,
  currentSearch,
}: PropertiesPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [search, setSearch] = useState(currentSearch)
  const [isPending, startTransition] = useTransition()

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value)
      else params.delete(key)
    })
    router.push(`/dashboard/properties?${params.toString()}`)
  }

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return
    try {
      await deleteProperties(selectedIds)
      toast.success(`Deleted ${selectedIds.length} properties`)
      setSelectedIds([])
      router.refresh()
    } catch {
      toast.error('Failed to delete properties')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-2xl text-dark">My Properties</h1>
          <p className="mt-1 font-body text-neutral">{total} properties total</p>
        </div>
        <Link href="/dashboard/upload">
          <Button className="gap-2 bg-gold text-dark hover:bg-gold-light">
            <PlusCircle className="size-4" />
            Upload Property
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => updateParams({ status, page: '1' })}
              className={cn(
                'rounded-full px-4 py-1.5 font-body text-sm transition-colors',
                currentStatus === status
                  ? 'bg-gold text-dark'
                  : 'bg-white text-neutral hover:bg-cream-dark'
              )}
            >
              {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            updateParams({ search, page: '1' })
          }}
          className="flex gap-2"
        >
          <Input
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64"
          />
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex items-center gap-4 rounded-lg bg-error/10 px-4 py-3">
          <span className="font-body text-sm text-dark">
            {selectedIds.length} selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            disabled={isPending}
            onClick={() => startTransition(handleBulkDelete)}
          >
            Delete Selected
          </Button>
        </div>
      )}

      {properties.length > 0 ? (
        <PropertiesTable
          properties={properties}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      ) : (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm">
          <p className="font-body text-neutral">No properties found.</p>
          <Link href="/dashboard/upload">
            <Button className="mt-4 bg-gold text-dark hover:bg-gold-light">
              Upload Now
            </Button>
          </Link>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => updateParams({ page: String(p) })}
              className={cn(
                'rounded-lg px-3 py-1.5 font-mono text-sm',
                p === page ? 'bg-gold text-dark' : 'bg-white text-neutral hover:bg-cream-dark'
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
