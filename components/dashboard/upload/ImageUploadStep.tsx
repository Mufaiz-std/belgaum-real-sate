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
import { Upload, GripVertical, X, AlertCircle, Loader2, ImageIcon } from 'lucide-react'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { optimizeImage } from '@/lib/imageOptimizer'
import { cn } from '@/lib/utils'

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_FILE_SIZE = 5 * 1024 * 1024   // 5 MB pre-compression input guard
const MAX_IMAGES = 5
const ALLOWED_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

// ─── Types ────────────────────────────────────────────────────────────────────
type UploadStage = 'compressing' | 'uploading'

interface UploadEntry {
  name: string
  stage: UploadStage
  progress: number     // 0-100
  error?: string
}

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

// ─── SortableImage ────────────────────────────────────────────────────────────
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

// ─── UploadProgress card ─────────────────────────────────────────────────────
function UploadProgressCard({ entry }: { entry: UploadEntry }) {
  if (entry.error) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-error/30 bg-error/5 p-3">
        <AlertCircle className="mt-0.5 size-4 shrink-0 text-error" />
        <div className="min-w-0">
          <p className="truncate font-body text-sm font-medium text-dark">{entry.name}</p>
          <p className="mt-0.5 font-mono text-xs text-error">{entry.error}</p>
        </div>
      </div>
    )
  }

  const label = entry.stage === 'compressing' ? 'Optimizing…' : 'Uploading…'

  return (
    <div className="rounded-lg border border-neutral/10 bg-white p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {entry.stage === 'compressing' ? (
            <ImageIcon className="size-4 shrink-0 text-gold" />
          ) : (
            <Loader2 className="size-4 shrink-0 animate-spin text-gold" />
          )}
          <p className="truncate font-body text-sm text-dark">{entry.name}</p>
        </div>
        <span className="ml-2 shrink-0 font-mono text-xs text-neutral">{label}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-cream-dark">
        <div
          className="h-full rounded-full bg-gold transition-all duration-300"
          style={{ width: `${entry.progress}%` }}
        />
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export function ImageUploadStep({ images, onChange, error }: ImageUploadStepProps) {
  const [uploadMap, setUploadMap] = useState<Record<string, UploadEntry>>({})
  const [dragOver, setDragOver] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // ── Helpers ──────────────────────────────────────────────────────────────
  const setEntry = (id: string, patch: Partial<UploadEntry>) =>
    setUploadMap((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }))

  const removeEntry = (id: string) =>
    setUploadMap((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })

  // Clear stale error cards after 4 seconds
  const scheduleErrorCleanup = (id: string) =>
    setTimeout(() => removeEntry(id), 4000)

  // ── File handling ─────────────────────────────────────────────────────────
  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const valid = Array.from(files).filter((f) => {
        if (!ALLOWED_MIME.includes(f.type)) return false
        if (f.size > MAX_FILE_SIZE) return false
        return true
      })

      // Respect max limit
      const slots = MAX_IMAGES - images.length
      const toProcess = valid.slice(0, slots)
      if (toProcess.length === 0) return

      let currentImages = [...images]

      for (const file of toProcess) {
        const id = `${file.name}-${Date.now()}`

        // Register entry
        setUploadMap((prev) => ({
          ...prev,
          [id]: { name: file.name, stage: 'compressing', progress: 10 },
        }))

        try {
          // ── Step 1: Optimize (Canvas resize + WEBP conversion + compress) ──
          const result = await optimizeImage(file)
          setEntry(id, { stage: 'compressing', progress: 50 })

          // ── Step 2: Transition to upload ──────────────────────────────────
          setEntry(id, { stage: 'uploading', progress: 60 })
          const url = await uploadToCloudinary(result.file)

          // ── Step 3: Success ───────────────────────────────────────────────
          setEntry(id, { stage: 'uploading', progress: 100 })
          currentImages = [...currentImages, url]
          onChange(currentImages)
          // Short delay so user sees 100% before card disappears
          setTimeout(() => removeEntry(id), 600)
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Upload failed'
          setEntry(id, { stage: 'uploading', progress: 0, error: message })
          scheduleErrorCleanup(id)
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [images, onChange]
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = images.indexOf(String(active.id))
    const newIndex = images.indexOf(String(over.id))
    onChange(arrayMove(images, oldIndex, newIndex))
  }

  const entries = Object.entries(uploadMap)
  const isFull = images.length >= MAX_IMAGES
  const activeUploads = entries.filter(([, e]) => !e.error).length

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          handleFiles(e.dataTransfer.files)
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-cream p-12 transition-colors',
          dragOver ? 'border-gold bg-gold/5' : 'border-neutral/30',
          isFull && 'pointer-events-none opacity-50'
        )}
        onClick={() => {
          if (isFull) return
          const input = document.createElement('input')
          input.type = 'file'
          input.multiple = true
          input.accept = 'image/jpeg,image/jpg,image/png,image/webp'
          input.onchange = (e) => {
            const files = (e.target as HTMLInputElement).files
            if (files) handleFiles(files)
          }
          input.click()
        }}
      >
        <Upload className="size-12 text-gold" />
        <p className="mt-4 font-body text-dark">
          Drag &amp; drop photos here, or click to browse
        </p>
        <p className="mt-2 font-mono text-xs text-neutral">
          JPG, PNG, WEBP · up to 5 MB each · Max {MAX_IMAGES} photos
        </p>
        <p className="mt-1 font-mono text-xs text-neutral/60">
          Images are auto-optimized to ~200 KB before upload
        </p>
      </div>

      {/* Progress cards */}
      {entries.length > 0 && (
        <div className="space-y-2">
          {entries.map(([id, entry]) => (
            <UploadProgressCard key={id} entry={entry} />
          ))}
        </div>
      )}

      {/* Uploaded image grid */}
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

      {/* Counter */}
      {(images.length > 0 || activeUploads > 0) && (
        <p className="font-mono text-xs text-neutral/60 text-right">
          {images.length} / {MAX_IMAGES} photos uploaded
        </p>
      )}

      {/* Validation error */}
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  )
}
