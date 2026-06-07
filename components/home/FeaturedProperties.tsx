'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PropertyCard, type Property } from '@/components/properties/PropertyCard'

// TODO: Replace mock data with API call
const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Premium 3BHK Villa near Tilakwadi',
    area: 'Tilakwadi',
    priceMin: 7500000,
    priceMax: 9500000,
    beds: 3,
    baths: 2,
    sqft: 1450,
    type: 'Villa',
    badge: 'FEATURED',
    image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600',
  },
  {
    id: '2',
    title: '2BHK Modern Flat in Camp Area',
    area: 'Camp Area',
    priceMin: 4500000,
    priceMax: 5500000,
    beds: 2,
    baths: 2,
    sqft: 980,
    type: 'Flat',
    badge: 'NEW',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600',
  },
  {
    id: '3',
    title: 'Residential Plot in Vadgaon',
    area: 'Vadgaon',
    priceMin: 3500000,
    priceMax: 4500000,
    beds: 0,
    baths: 0,
    sqft: 2400,
    type: 'Plot',
    badge: 'HOT',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600',
  },
  {
    id: '4',
    title: 'Commercial Showroom on Khanapur Road',
    area: 'Khanapur Road',
    priceMin: 8500000,
    priceMax: 10000000,
    beds: 0,
    baths: 1,
    sqft: 3200,
    type: 'Commercial',
    badge: 'FEATURED',
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600',
  },
  {
    id: '5',
    title: '4BHK Independent House in Shahapur',
    area: 'Shahapur',
    priceMin: 9000000,
    priceMax: 12000000,
    beds: 4,
    baths: 3,
    sqft: 2800,
    type: 'House',
    badge: 'NEW',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600',
  },
  {
    id: '6',
    title: 'Agricultural Land in Angol',
    area: 'Angol',
    priceMin: 2000000,
    priceMax: 3500000,
    beds: 0,
    baths: 0,
    sqft: 10000,
    type: 'Agricultural',
    badge: 'FEATURED',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600',
  },
]

interface FeaturedPropertiesProps {
  categoryFilter?: string
}

export function FeaturedProperties({
  categoryFilter = 'all',
}: FeaturedPropertiesProps) {
  // Filter properties based on category
  const filteredProperties =
    categoryFilter === 'all'
      ? mockProperties
      : mockProperties.filter(
          (p) => p.type.toLowerCase() === categoryFilter.toLowerCase()
        )

  const displayProperties =
    filteredProperties.length > 0 ? filteredProperties : mockProperties

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
          {displayProperties.map((property, index) => (
            <PropertyCard key={property.id} property={property} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturedProperties
