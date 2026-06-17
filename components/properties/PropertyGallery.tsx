'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { AccessLevel } from '@/lib/types'

interface PropertyGalleryProps {
  images: string[]
  title: string
  accessLevel: AccessLevel
  onUnlockClick: () => void
  isUnlocking?: boolean
}

export function PropertyGallery({
  images,
  title,
  accessLevel,
  onUnlockClick,
  isUnlocking = false,
}: PropertyGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const isGuest = accessLevel === 'GUEST'
  // Guests & registered users cannot open the full gallery
  const galleryLocked = isGuest || accessLevel === 'REGISTERED'

  const goToPrevious = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  // When a locked user clicks a thumbnail or "View All", open the upgrade popup
  const handleLockedInteraction = (e: React.MouseEvent) => {
    e.stopPropagation()
    onUnlockClick()
  }

  return (
    <>
      {/* Main Gallery */}
      <div className="relative">
        {/* Cover Photo — always visible, no overlay */}
        <div
          className={`relative h-[480px] rounded-2xl overflow-hidden ${
            !galleryLocked ? 'cursor-pointer' : ''
          }`}
          onClick={() => !galleryLocked && setLightboxOpen(true)}
        >
          <Image
            src={images[0]}
            alt={`${title} - Cover Photo`}
            fill
            className="object-cover"
            sizes="(max-width: 1200px) 100vw, 65vw"
            priority
          />

          {/* "View All" badge — triggers popup for locked, lightbox for unlocked */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (galleryLocked) {
                  onUnlockClick()
                } else {
                  setLightboxOpen(true)
                }
              }}
              disabled={isUnlocking}
              className="absolute bottom-4 right-4 px-4 py-2 bg-dark/80 text-white font-mono text-sm rounded-lg hover:bg-dark transition-colors backdrop-blur-sm flex items-center gap-2"
            >
              {isUnlocking ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : null}
              {isUnlocking ? 'Unlocking...' : `View All ${images.length} Photos`}
            </button>
          )}
        </div>

        {/* Thumbnail Row — always shown; locked thumbnails are blurred and trigger popup */}
        {images.length > 1 && (
          <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={
                  galleryLocked
                    ? handleLockedInteraction
                    : () => setActiveIndex(index)
                }
                className={`relative w-24 h-16 flex-shrink-0 rounded-lg overflow-hidden transition-all duration-200 ${
                  !galleryLocked && activeIndex === index
                    ? 'ring-2 ring-gold ring-offset-2'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <Image
                  src={image}
                  alt={`${title} - Thumbnail ${index + 1}`}
                  fill
                  className={`object-cover ${galleryLocked && index > 0 ? 'blur-sm' : ''}`}
                  sizes="96px"
                />
                {/* Lock icon overlay on non-cover thumbnails for locked users */}
                {galleryLocked && index > 0 && (
                  <div className="absolute inset-0 bg-dark/40 flex items-center justify-center">
                    <span className="text-white text-xs font-mono">🔒</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal — only for unlocked users */}
      <AnimatePresence>
        {lightboxOpen && !galleryLocked && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxOpen(false)}
              className="fixed inset-0 bg-dark/95 z-50"
            />

            {/* Lightbox Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              {/* Close Button */}
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
                aria-label="Close lightbox"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Navigation Buttons */}
              <button
                onClick={goToPrevious}
                className="absolute left-4 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={goToNext}
                className="absolute right-4 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Image */}
              <div className="relative w-full max-w-5xl h-[80vh]">
                <Image
                  src={images[activeIndex]}
                  alt={`${title} - Image ${activeIndex + 1}`}
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              </div>

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-dark/80 text-white font-mono text-sm rounded-lg">
                {activeIndex + 1} / {images.length}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default PropertyGallery
