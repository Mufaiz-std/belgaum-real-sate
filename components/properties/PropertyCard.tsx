'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Bed, Bath, Maximize2, Lock } from 'lucide-react'

export interface Property {
  id: string
  title: string
  area: string
  priceMin: number
  priceMax: number
  beds: number
  baths: number
  sqft: number
  type: string
  badge?: 'FEATURED' | 'NEW' | 'HOT' | 'SOLD'
  image: string
}

interface PropertyCardProps {
  property: Property
  index?: number
}

const badgeColors = {
  FEATURED: 'bg-gold text-dark',
  NEW: 'bg-success text-white',
  HOT: 'bg-error text-white',
  SOLD: 'bg-neutral text-white',
}

function formatPrice(price: number): string {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`
  } else if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} L`
  }
  return `₹${price.toLocaleString('en-IN')}`
}

export function PropertyCard({ property, index = 0 }: PropertyCardProps) {
  const { id, title, area, priceMin, priceMax, beds, baths, sqft, badge, image } =
    property

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        y: -6,
        transition: { duration: 0.2 },
      }}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gold"
    >
      {/* Image Container */}
      <div className="relative h-56 overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized={image.includes('unsplash.com')}
        />

        {/* Badge */}
        {badge && (
          <div
            className={`absolute top-4 left-4 px-3 py-1 rounded-full font-mono text-xs font-bold ${badgeColors[badge]}`}
          >
            {badge}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Location */}
        <p className="font-mono text-xs text-neutral mb-1">{area}, Belagavi</p>

        {/* Title */}
        <h3 className="font-body font-semibold text-dark text-lg mb-4 line-clamp-2">
          {title}
        </h3>

        {/* Features */}
        {(beds > 0 || baths > 0 || sqft > 0) && (
          <div className="flex items-center gap-4 mb-4 text-neutral">
            {beds > 0 && (
              <div className="flex items-center gap-1.5">
                <Bed className="w-4 h-4" />
                <span className="font-mono text-sm">{beds}</span>
              </div>
            )}
            {baths > 0 && (
              <div className="flex items-center gap-1.5">
                <Bath className="w-4 h-4" />
                <span className="font-mono text-sm">{baths}</span>
              </div>
            )}
            {sqft > 0 && (
              <div className="flex items-center gap-1.5">
                <Maximize2 className="w-4 h-4" />
                <span className="font-mono text-sm">
                  {sqft.toLocaleString()} sqft
                </span>
              </div>
            )}
          </div>
        )}

        {/* Price */}
        <div className="mb-4">
          <p className="font-mono text-xs text-neutral mb-1">Price Range</p>
          <p className="font-body font-bold text-gold text-xl">
            {formatPrice(priceMin)} – {formatPrice(priceMax)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href={`/properties/${id}`}
            className="flex-1 px-4 py-2.5 bg-cream text-dark font-body font-medium rounded-lg text-center hover:bg-cream-dark transition-colors duration-200"
          >
            View Details
          </Link>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gold/30 text-neutral font-body text-sm rounded-lg hover:border-gold hover:text-gold transition-colors duration-200">
            <Lock className="w-4 h-4" />
            Unlock
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default PropertyCard
