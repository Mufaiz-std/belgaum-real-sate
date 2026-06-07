'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Lock, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { AccessLevel } from '@/lib/types'

interface PropertyGalleryProps {
  images: string[]
  title: string
  accessLevel: AccessLevel
  onUnlockClick: () => void
}

export function PropertyGallery({
  images,
  title,
  accessLevel,
  onUnlockClick,
}: PropertyGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const isLocked = accessLevel === 'GUEST' || accessLevel === 'REGISTERED'
  const displayImages = isLocked ? [images[0]] : images

  const goToPrevious = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return (
    <>
      {/* Main Gallery */}
      <div className="relative">
        {/* Main Image */}
        <div
          className={`relative h-[480px] rounded-2xl overflow-hidden ${
            !isLocked ? 'cursor-pointer' : ''
          }`}
          onClick={() => !isLocked && setLightboxOpen(true)}
        >
          <Image
            src={displayImages[activeIndex] || images[0]}
            alt={`${title} - Image ${activeIndex + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 1200px) 100vw, 65vw"
            priority
          />

          {/* Lock Overlay for Guest/Registered */}
          {isLocked && (
            <div className="absolute inset-0 bg-dark/60 backdrop-blur-sm flex flex-col items-center justify-center">
              <div className="text-center px-6">
                <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-gold" />
                </div>
                <h3 className="font-body font-semibold text-white text-lg mb-2">
                  Unlock to view all {images.length} photos
                </h3>
                <p className="font-mono text-sm text-gold mb-4">
                  ₹500 one-time
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onUnlockClick()
                  }}
                  className="px-6 py-3 bg-gold text-dark font-body font-semibold rounded-lg hover:bg-gold-dark transition-colors duration-200"
                >
                  Unlock Now
                </button>
              </div>
            </div>
          )}

          {/* View All Badge (for unlocked) */}
          {!isLocked && images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setLightboxOpen(true)
              }}
              className="absolute bottom-4 right-4 px-4 py-2 bg-dark/80 text-white font-mono text-sm rounded-lg hover:bg-dark transition-colors backdrop-blur-sm"
            >
              View All {images.length} Photos
            </button>
          )}
        </div>

        {/* Thumbnail Row (only for unlocked users) */}
        {!isLocked && images.length > 1 && (
          <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`relative w-24 h-16 flex-shrink-0 rounded-lg overflow-hidden transition-all duration-200 ${
                  activeIndex === index
                    ? 'ring-2 ring-gold ring-offset-2'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <Image
                  src={image}
                  alt={`${title} - Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && !isLocked && (
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
