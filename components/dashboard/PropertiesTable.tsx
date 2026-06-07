'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, Trash2 } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  useDialog,
} from '@/components/ui/dialog'
import { deleteProperty } from '@/actions/property'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface PropertyRow {
  id: string
  slug: string
  title: string
  area: string
  status: string
  coverImage?: string
}

function DeletePropertyDialog({
  title,
  deleting,
  onConfirm,
}: {
  title: string
  deleting: boolean
  onConfirm: () => void
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-error hover:bg-error/10"
        >
          <Trash2 className="size-4" />
          Delete
        </button>
      </DialogTrigger>
      <DeletePropertyDialogContent title={title} deleting={deleting} onConfirm={onConfirm} />
    </Dialog>
  )
}

function DeletePropertyDialogContent({
  title,
  deleting,
  onConfirm,
}: {
  title: string
  deleting: boolean
  onConfirm: () => void
}) {
  const { setOpen } = useDialog()

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete property?</DialogTitle>
        <DialogDescription>
          This will permanently delete &quot;{title}&quot;. This action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button
          variant="destructive"
          disabled={deleting}
          onClick={() => {
            onConfirm()
            setOpen(false)
          }}
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

interface PropertiesTableProps {
  properties: PropertyRow[]
  showIndex?: boolean
  selectable?: boolean
  selectedIds?: string[]
  onSelectionChange?: (ids: string[]) => void
  onDelete?: (id: string) => void
}

export function PropertiesTable({
  properties,
  showIndex = true,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  onDelete,
}: PropertiesTableProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id)
      await deleteProperty(id)
      toast.success('Property deleted')
      onDelete?.(id)
      router.refresh()
    } catch {
      toast.error('Failed to delete property')
    } finally {
      setDeletingId(null)
    }
  }

  const toggleSelect = (id: string) => {
    if (!onSelectionChange) return
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((s) => s !== id))
    } else {
      onSelectionChange([...selectedIds, id])
    }
  }

  if (properties.length === 0) return null

  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
      <table className="w-full min-w-[640px]">
        <thead>
          <tr className="border-b border-cream-dark text-left">
            {selectable && <th className="p-4 w-10" />}
            {showIndex && <th className="p-4 font-mono text-xs text-neutral">#</th>}
            <th className="p-4 font-body text-sm font-medium text-neutral">Image</th>
            <th className="p-4 font-body text-sm font-medium text-neutral">Title</th>
            <th className="p-4 font-body text-sm font-medium text-neutral">Area</th>
            <th className="p-4 font-body text-sm font-medium text-neutral">Status</th>
            <th className="p-4 font-body text-sm font-medium text-neutral">Actions</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((property, index) => (
            <motion.tr
              key={property.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border-b border-cream-dark/50 last:border-0"
            >
              {selectable && (
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(property.id)}
                    onChange={() => toggleSelect(property.id)}
                    className="size-4 accent-gold"
                  />
                </td>
              )}
              {showIndex && (
                <td className="p-4 font-mono text-sm text-neutral">{index + 1}</td>
              )}
              <td className="p-4">
                <div className="relative size-[60px] overflow-hidden rounded-lg bg-cream-dark">
                  {property.coverImage ? (
                    <Image
                      src={property.coverImage}
                      alt={property.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-neutral text-xs">
                      No img
                    </div>
                  )}
                </div>
              </td>
              <td className="max-w-[200px] p-4">
                <p className="truncate font-body font-semibold text-dark">{property.title}</p>
              </td>
              <td className="p-4 font-mono text-sm text-neutral">{property.area}</td>
              <td className="p-4">
                <StatusBadge status={property.status} />
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/properties/${property.slug}`}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-neutral hover:bg-cream hover:text-dark"
                  >
                    <Eye className="size-4" />
                    View
                  </Link>
                  <DeletePropertyDialog
                    title={property.title}
                    deleting={deletingId === property.id}
                    onConfirm={() => handleDelete(property.id)}
                  />
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
