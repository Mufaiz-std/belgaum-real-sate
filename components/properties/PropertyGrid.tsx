'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Bed, Bath, Maximize2, Lock, LayoutGrid, List } from 'lucide-react'
import { Property } from '@/lib/types'

interface PropertyGridProps {
  properties: Property[]
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  totalCount: number
  sortBy: string
  onSortChange: (sort: string) => void
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

function GridPropertyCard({
  property,
  index,
}: {
  property: Property
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        y: -6,
        transition: { duration: 0.2 },
      }}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gold"
    >
      {/* Image Container */}
      <div className="relative h-60 overflow-hidden">
        {property.coverImage ? (
          <Image
            src={property.coverImage}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-cream flex items-center justify-center text-neutral font-mono text-sm">
            No Image
          </div>
        )}

        {/* Badge */}
        {property.badge && (
          <div
            className={`absolute top-4 left-4 px-3 py-1 rounded-full font-mono text-xs font-bold ${badgeColors[property.badge]}`}
          >
            {property.badge}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Area & Type */}
        <p className="font-mono text-xs text-neutral mb-1">
          {property.area} | {property.propertyType}
        </p>

        {/* Title */}
        <h3 className="font-body font-semibold text-dark text-lg mb-3 line-clamp-2">
          {property.title}
        </h3>

        {/* Features */}
        <div className="flex items-center gap-4 mb-4 text-neutral">
          {property.bedrooms && property.bedrooms > 0 && (
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4" />
              <span className="font-mono text-sm">{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms && property.bathrooms > 0 && (
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4" />
              <span className="font-mono text-sm">{property.bathrooms}</span>
            </div>
          )}
          {property.areaSqft && property.areaSqft > 0 && (
            <div className="flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4" />
              <span className="font-mono text-sm">
                {property.areaSqft.toLocaleString()} sqft
              </span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="mb-4">
          <p className="font-body font-bold text-gold text-xl">
            {formatPrice(property.priceMin)} – {formatPrice(property.priceMax)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href={`/properties/${property.slug}`}
            className="flex-1 px-4 py-2.5 bg-dark text-white font-body font-medium rounded-lg text-center hover:bg-dark/90 transition-colors duration-200"
          >
            View Details
          </Link>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gold text-gold font-mono text-sm rounded-lg hover:bg-gold hover:text-dark transition-colors duration-200">
            <Lock className="w-4 h-4" />
            ₹500
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function ListPropertyCard({
  property,
  index,
}: {
  property: Property
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        y: -4,
        transition: { duration: 0.2 },
      }}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gold flex flex-col md:flex-row"
    >
      {/* Image Container */}
      <div className="relative w-full md:w-80 h-56 md:h-auto flex-shrink-0 overflow-hidden">
        {property.coverImage ? (
          <Image
            src={property.coverImage}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 320px"
          />
        ) : (
          <div className="w-full h-full bg-cream flex items-center justify-center text-neutral font-mono text-sm">
            No Image
          </div>
        )}

        {/* Badge */}
        {property.badge && (
          <div
            className={`absolute top-4 left-4 px-3 py-1 rounded-full font-mono text-xs font-bold ${badgeColors[property.badge]}`}
          >
            {property.badge}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          {/* Area & Type */}
          <p className="font-mono text-xs text-neutral mb-1">
            {property.area} | {property.propertyType}
          </p>

          {/* Title */}
          <h3 className="font-body font-semibold text-dark text-xl mb-3">
            {property.title}
          </h3>

          {/* Features */}
          <div className="flex items-center gap-6 mb-4 text-neutral">
            {property.bedrooms && property.bedrooms > 0 && (
              <div className="flex items-center gap-1.5">
                <Bed className="w-4 h-4" />
                <span className="font-mono text-sm">
                  {property.bedrooms} Beds
                </span>
              </div>
            )}
            {property.bathrooms && property.bathrooms > 0 && (
              <div className="flex items-center gap-1.5">
                <Bath className="w-4 h-4" />
                <span className="font-mono text-sm">
                  {property.bathrooms} Baths
                </span>
              </div>
            )}
            {property.areaSqft && property.areaSqft > 0 && (
              <div className="flex items-center gap-1.5">
                <Maximize2 className="w-4 h-4" />
                <span className="font-mono text-sm">
                  {property.areaSqft.toLocaleString()} sqft
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          {/* Price */}
          <p className="font-body font-bold text-gold text-xl">
            {formatPrice(property.priceMin)} – {formatPrice(property.priceMax)}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              href={`/properties/${property.slug}`}
              className="px-5 py-2.5 bg-dark text-white font-body font-medium rounded-lg text-center hover:bg-dark/90 transition-colors duration-200"
            >
              View Details
            </Link>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gold text-gold font-mono text-sm rounded-lg hover:bg-gold hover:text-dark transition-colors duration-200">
              <Lock className="w-4 h-4" />
              Unlock ₹500
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function PropertyGrid({
  properties,
  viewMode,
  onViewModeChange,
  totalCount,
  sortBy,
  onSortChange,
}: PropertyGridProps) {
  return (
    <div>
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <p className="font-mono text-sm text-neutral">
          Showing{' '}
          <span className="text-dark font-semibold">{properties.length}</span>{' '}
          of <span className="text-dark font-semibold">{totalCount}</span>{' '}
          properties
        </p>

        <div className="flex items-center gap-4">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <label className="font-mono text-xs text-neutral">Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="px-3 py-2 bg-white border border-cream-dark rounded-lg font-body text-sm text-dark focus:outline-none focus:ring-2 focus:ring-gold/50"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="area-high">Area: High to Low</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center border border-cream-dark rounded-lg overflow-hidden">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2.5 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-gold text-dark'
                  : 'bg-white text-neutral hover:text-dark'
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2.5 transition-colors ${
                viewMode === 'list'
                  ? 'bg-gold text-dark'
                  : 'bg-white text-neutral hover:text-dark'
              }`}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Property Cards */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property, index) => (
            <GridPropertyCard
              key={property.id}
              property={property}
              index={index}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {properties.map((property, index) => (
            <ListPropertyCard
              key={property.id}
              property={property}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default PropertyGrid
