'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PropertyCard, type Property } from '@/components/properties/PropertyCard'

interface FeaturedPropertiesProps {
  categoryFilter?: string
  properties: Property[]
}

export function FeaturedProperties({
  categoryFilter = 'all',
  properties,
}: FeaturedPropertiesProps) {
  // Filter properties based on category
  const filteredProperties =
    categoryFilter === 'all'
      ? properties
      : properties.filter(
          (p) => p.type.toLowerCase() === categoryFilter.toLowerCase()
        )

  const displayProperties =
    filteredProperties.length > 0 ? filteredProperties : properties

  if (!displayProperties.length) {
    return null
  }

  return (
    <section className="bg-cream py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10">
          <div>
            <p className="font-mono text-gold text-xs uppercase tracking-wider mb-2">
              PROPERTIES IN BELAGAVI
            </p>
            <h2 className="font-headline text-3xl sm:text-4xl font-semibold text-dark">
              Featured properties
            </h2>
          </div>
          <Link
            href="/properties"
            className="mt-4 sm:mt-0 flex items-center gap-2 text-gold font-body font-medium hover:text-gold-dark transition-colors"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {displayProperties.slice(0, 6).map((property, index) => (
            <PropertyCard key={property.id} property={property} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturedProperties
