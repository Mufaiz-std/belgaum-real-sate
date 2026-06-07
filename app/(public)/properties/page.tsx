'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import PropertyFilters from '@/components/properties/PropertyFilters'
import PropertyGrid from '@/components/properties/PropertyGrid'
import Pagination from '@/components/properties/Pagination'
import EmptyState from '@/components/properties/EmptyState'
import { mockProperties } from '@/lib/mock-data'
import { Property } from '@/lib/types'

const ITEMS_PER_PAGE = 12

interface Filters {
  search: string
  propertyType: string
  status: string
  bedrooms: string
  bathrooms: string
  priceMin: string
  priceMax: string
  areaMin: string
  areaMax: string
  propertyId: string
}

const defaultFilters: Filters = {
  search: '',
  propertyType: 'All Types',
  status: 'All Status',
  bedrooms: 'All',
  bathrooms: 'All',
  priceMin: '',
  priceMax: '',
  areaMin: '',
  areaMax: '',
  propertyId: '',
}

export default function PropertiesPage() {
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)

  // TODO: Replace with API call to /api/properties with filter params
  const filteredProperties = useMemo(() => {
    let result = [...mockProperties]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(searchLower) ||
          p.area.toLowerCase().includes(searchLower) ||
          p.city.toLowerCase().includes(searchLower)
      )
    }

    // Property type filter
    if (filters.propertyType !== 'All Types') {
      const typeMap: Record<string, Property['propertyType']> = {
        Flat: 'APARTMENT',
        House: 'HOUSE',
        Plot: 'PLOT',
        Bungalow: 'VILLA',
        Commercial: 'COMMERCIAL',
        Agricultural: 'AGRICULTURAL',
      }
      result = result.filter((p) => p.propertyType === typeMap[filters.propertyType])
    }

    // Status filter
    if (filters.status !== 'All Status') {
      result = result.filter(
        (p) => p.status === filters.status.toUpperCase()
      )
    }

    // Bedrooms filter
    if (filters.bedrooms !== 'All') {
      if (filters.bedrooms === 'N/A') {
        result = result.filter((p) => p.bedrooms === null)
      } else {
        const beds = parseInt(filters.bedrooms)
        if (filters.bedrooms === '5+ BHK') {
          result = result.filter((p) => p.bedrooms && p.bedrooms >= 5)
        } else {
          result = result.filter((p) => p.bedrooms === beds)
        }
      }
    }

    // Bathrooms filter
    if (filters.bathrooms !== 'All') {
      if (filters.bathrooms === '4+') {
        result = result.filter((p) => p.bathrooms && p.bathrooms >= 4)
      } else {
        const baths = parseInt(filters.bathrooms)
        result = result.filter((p) => p.bathrooms === baths)
      }
    }

    // Price range filter
    if (filters.priceMin) {
      const minPrice = parseInt(filters.priceMin.replace(/\D/g, ''))
      if (!isNaN(minPrice)) {
        result = result.filter((p) => p.priceMax >= minPrice)
      }
    }
    if (filters.priceMax) {
      const maxPrice = parseInt(filters.priceMax.replace(/\D/g, ''))
      if (!isNaN(maxPrice)) {
        result = result.filter((p) => p.priceMin <= maxPrice)
      }
    }

    // Area range filter
    if (filters.areaMin) {
      const minArea = parseInt(filters.areaMin.replace(/\D/g, ''))
      if (!isNaN(minArea)) {
        result = result.filter((p) => p.areaSqft && p.areaSqft >= minArea)
      }
    }
    if (filters.areaMax) {
      const maxArea = parseInt(filters.areaMax.replace(/\D/g, ''))
      if (!isNaN(maxArea)) {
        result = result.filter((p) => p.areaSqft && p.areaSqft <= maxArea)
      }
    }

    // Sorting
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.priceMin - b.priceMin)
        break
      case 'price-high':
        result.sort((a, b) => b.priceMax - a.priceMax)
        break
      case 'area-high':
        result.sort((a, b) => (b.areaSqft || 0) - (a.areaSqft || 0))
        break
      default:
        // newest - keep default order (assuming mock data is newest first)
        break
    }

    return result
  }, [filters, sortBy])

  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE)
  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleSearch = () => {
    setCurrentPage(1)
  }

  const handleClearFilters = () => {
    setFilters(defaultFilters)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="font-display text-4xl md:text-5xl text-dark mb-4">
              Properties in Belagavi
            </h1>
            <p className="font-body text-neutral text-lg max-w-2xl mx-auto">
              Browse through our curated collection of properties. Direct from
              owners, zero brokerage.
            </p>
          </motion.div>

          {/* Filters */}
          <div className="mb-8">
            <PropertyFilters
              filters={filters}
              onFiltersChange={setFilters}
              onSearch={handleSearch}
            />
          </div>

          {/* Results */}
          {paginatedProperties.length > 0 ? (
            <>
              <PropertyGrid
                properties={paginatedProperties}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                totalCount={filteredProperties.length}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredProperties.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          ) : (
            <EmptyState onClearFilters={handleClearFilters} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
