'use client'

import { useCallback, useState } from 'react'
import Image from 'next/image'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Upload, GripVertical, X } from 'lucide-react'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { cn } from '@/lib/utils'

interface ImageUploadStepProps {
  images: string[]
  onChange: (images: string[]) => void
  error?: string
}

interface SortableImageProps {
  url: string
  index: number
  onRemove: () => void
}

function SortableImage({ url, index, onRemove }: SortableImageProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: url,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative aspect-square overflow-hidden rounded-lg bg-cream-dark',
        isDragging && 'z-10 opacity-80'
      )}
    >
      <Image src={url} alt={`Property ${index + 1}`} fill className="object-cover" />
      {index === 0 && (
        <span className="absolute left-2 top-2 rounded bg-gold px-2 py-0.5 font-mono text-[10px] font-bold text-dark">
          Cover
        </span>
      )}
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 rounded-full bg-error p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
      >
        <X className="size-3" />
      </button>
      <button
        type="button"
        className="absolute bottom-2 left-2 rounded bg-dark/60 p-1 text-white"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
    </div>
  )
}

export function ImageUploadStep({ images, onChange, error }: ImageUploadStepProps) {
  const [uploading, setUploading] = useState<Record<string, number>>({})
  const [dragOver, setDragOver] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files).filter(
        (f) => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024
      )

      if (images.length + fileArray.length > 10) return

      let currentImages = [...images]

      for (const file of fileArray) {
        const tempId = `uploading-${file.name}-${Date.now()}`
        setUploading((prev) => ({ ...prev, [tempId]: 0 }))

        try {
          setUploading((prev) => ({ ...prev, [tempId]: 50 }))
          const url = await uploadToCloudinary(file)
          currentImages = [...currentImages, url]
          onChange(currentImages)
          setUploading((prev) => {
            const next = { ...prev }
            delete next[tempId]
            return next
          })
        } catch {
          setUploading((prev) => {
            const next = { ...prev }
            delete next[tempId]
            return next
          })
        }
      }
    },
    [images, onChange]
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = images.indexOf(String(active.id))
    const newIndex = images.indexOf(String(over.id))
    onChange(arrayMove(images, oldIndex, newIndex))
  }

  const uploadingCount = Object.keys(uploading).length

  return (
    <div className="space-y-6">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          handleFiles(e.dataTransfer.files)
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-cream p-12 transition-colors',
          dragOver ? 'border-gold bg-gold/5' : 'border-neutral/30',
          images.length >= 10 && 'pointer-events-none opacity-50'
        )}
        onClick={() => {
          const input = document.createElement('input')
          input.type = 'file'
          input.multiple = true
          input.accept = 'image/jpeg,image/png,image/webp'
          input.onchange = (e) => {
            const files = (e.target as HTMLInputElement).files
            if (files) handleFiles(files)
          }
          input.click()
        }}
      >
        <Upload className="size-12 text-gold" />
        <p className="mt-4 font-body text-dark">
          Drag & drop photos here, or click to browse
        </p>
        <p className="mt-2 font-mono text-xs text-neutral">
          JPG, PNG up to 5MB each | Min 3, Max 10 photos
        </p>
      </div>

      {uploadingCount > 0 && (
        <div className="space-y-2">
          {Object.entries(uploading).map(([id, progress]) => (
            <div key={id} className="rounded-lg bg-white p-3">
              <p className="font-body text-sm text-neutral">Uploading...</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-cream-dark">
                <div
                  className="h-full rounded-full bg-gold transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={images} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-3 gap-4">
              {images.map((url, index) => (
                <SortableImage
                  key={url}
                  url={url}
                  index={index}
                  onRemove={() => onChange(images.filter((_, i) => i !== index))}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  )
}
