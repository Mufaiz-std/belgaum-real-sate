'use client'

import { useState, useEffect, useCallback, useTransition } from 'react'
import { motion } from 'framer-motion'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import PropertyFilters from '@/components/properties/PropertyFilters'
import PropertyGrid from '@/components/properties/PropertyGrid'
import Pagination from '@/components/properties/Pagination'
import EmptyState from '@/components/properties/EmptyState'
import { Property } from '@/lib/types'

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


const SORT_MAP: Record<string, string> = {
  newest: 'newest',
  'price-low': 'price_asc',
  'price-high': 'price_desc',
  'area-high': 'newest', // fallback — API doesn't have area sort
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export default function PropertiesPage() {
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [properties, setProperties] = useState<Property[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const [, startTransition] = useTransition()

  const fetchProperties = useCallback(async (f: Filters, sort: string, page: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (f.search) params.set('q', f.search)
      if (f.propertyType !== 'All Types') params.set('type', f.propertyType)
      if (f.priceMin) params.set('priceMin', f.priceMin.replace(/\D/g, ''))
      if (f.priceMax) params.set('priceMax', f.priceMax.replace(/\D/g, ''))
      if (f.bedrooms !== 'All' && f.bedrooms !== 'N/A' && !f.bedrooms.includes('+')) {
        params.set('bedrooms', f.bedrooms)
      }
      params.set('sort', SORT_MAP[sort] ?? 'newest')
      params.set('page', String(page))

      const res = await fetch(`/api/properties?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch properties')
      const data = await res.json()
      setProperties(data.properties ?? [])
      setPagination(data.pagination ?? null)
    } catch (err) {
      console.error(err)
      setProperties([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initialize state from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    
    if (params.get('page')) setCurrentPage(Number(params.get('page')))
    if (params.get('sortBy')) setSortBy(params.get('sortBy')!)
    
    const newFilters = { ...defaultFilters }
    if (params.get('propertyType')) newFilters.propertyType = params.get('propertyType')!
    if (params.get('status')) newFilters.status = params.get('status')!
    if (params.get('bedrooms')) newFilters.bedrooms = params.get('bedrooms')!
    if (params.get('bathrooms')) newFilters.bathrooms = params.get('bathrooms')!
    if (params.get('priceMin')) newFilters.priceMin = params.get('priceMin')!
    if (params.get('priceMax')) newFilters.priceMax = params.get('priceMax')!
    if (params.get('areaMin')) newFilters.areaMin = params.get('areaMin')!
    if (params.get('areaMax')) newFilters.areaMax = params.get('areaMax')!
    if (params.get('search')) newFilters.search = params.get('search')!
    
    setFilters(newFilters)
    setInitialized(true)
  }, [])

  // Sync state to URL and fetch whenever filters/sort/page changes
  useEffect(() => {
    if (!initialized) return

    const params = new URLSearchParams()
    if (currentPage > 1) params.set('page', currentPage.toString())
    if (sortBy !== 'newest') params.set('sortBy', sortBy)
    if (filters.propertyType !== 'All Types') params.set('propertyType', filters.propertyType)
    if (filters.status !== 'All Status') params.set('status', filters.status)
    if (filters.bedrooms !== 'All') params.set('bedrooms', filters.bedrooms)
    if (filters.bathrooms !== 'All') params.set('bathrooms', filters.bathrooms)
    if (filters.priceMin) params.set('priceMin', filters.priceMin)
    if (filters.priceMax) params.set('priceMax', filters.priceMax)
    if (filters.areaMin) params.set('areaMin', filters.areaMin)
    if (filters.areaMax) params.set('areaMax', filters.areaMax)
    if (filters.search) params.set('search', filters.search)

    const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname
    window.history.replaceState(null, '', newUrl)

    startTransition(() => {
      fetchProperties(filters, sortBy, currentPage)
    })
  }, [filters, sortBy, currentPage, fetchProperties, initialized])

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

  const handleSortChange = (sort: string) => {
    setSortBy(sort)
    setCurrentPage(1)
  }

  const totalCount = pagination?.total ?? 0
  const totalPages = pagination?.totalPages ?? 0

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

          {/* Loading skeleton */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse shadow-sm">
                  <div className="h-52 bg-neutral/20" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-neutral/20 rounded w-3/4" />
                    <div className="h-4 bg-neutral/20 rounded w-1/2" />
                    <div className="h-4 bg-neutral/20 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : properties.length > 0 ? (
            <>
              <PropertyGrid
                properties={properties}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                totalCount={totalCount}
                sortBy={sortBy}
                onSortChange={handleSortChange}
              />

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalCount}
                  itemsPerPage={12}
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
