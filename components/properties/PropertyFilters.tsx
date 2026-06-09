'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, RotateCcw, ChevronDown } from 'lucide-react'

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

interface PropertyFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  onSearch: () => void
}


const statusOptions = ['All Status', 'Active', 'Sold']

const bedroomOptions = ['All', '1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK', 'N/A']

const bathroomOptions = ['All', '1', '2', '3', '4+']

function SelectDropdown({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder: string
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full px-4 py-3 pr-10 bg-white border border-cream-dark rounded-lg font-body text-sm text-dark focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold cursor-pointer"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral pointer-events-none" />
    </div>
  )
}

export function PropertyFilters({
  filters,
  onFiltersChange,
  onSearch,
}: PropertyFiltersProps) {
  const [propertyTypes, setPropertyTypes] = useState<string[]>(['All Types'])

  useEffect(() => {
    fetch('/api/public/settings')
      .then(res => res.json())
      .then(data => {
        if (data.propertyTypes) {
          setPropertyTypes(['All Types', ...data.propertyTypes.map((t: any) => t.name)])
        }
      })
      .catch(console.error)
  }, [])

  const updateFilter = (key: keyof Filters, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'search' || key === 'propertyId') return value !== ''
    if (key === 'propertyType') return value !== 'All Types'
    if (key === 'status') return value !== 'All Status'
    if (key === 'bedrooms' || key === 'bathrooms') return value !== 'All'
    return value !== ''
  }).length

  const clearAllFilters = () => {
    onFiltersChange({
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
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-cream-dark p-4 lg:p-6"
    >
      <div className="flex flex-wrap gap-3 items-end">
        {/* Search Input */}
        <div className="w-full lg:w-auto lg:flex-1 lg:min-w-[280px]">
          <label className="block font-mono text-xs text-neutral mb-1.5 uppercase">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="Search by location, area, or keyword..."
              className="w-full pl-10 pr-4 py-3 bg-cream/50 border border-cream-dark rounded-lg font-body text-sm text-dark placeholder:text-neutral focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
            />
          </div>
        </div>

        {/* Property Type */}
        <div className="w-[calc(50%-6px)] sm:w-auto sm:min-w-[140px]">
          <label className="block font-mono text-xs text-neutral mb-1.5 uppercase">
            Type
          </label>
          <SelectDropdown
            value={filters.propertyType}
            onChange={(value) => updateFilter('propertyType', value)}
            options={propertyTypes}
            placeholder="All Types"
          />
        </div>

        {/* Status */}
        <div className="w-[calc(50%-6px)] sm:w-auto sm:min-w-[120px]">
          <label className="block font-mono text-xs text-neutral mb-1.5 uppercase">
            Status
          </label>
          <SelectDropdown
            value={filters.status}
            onChange={(value) => updateFilter('status', value)}
            options={statusOptions}
            placeholder="All Status"
          />
        </div>

        {/* Bedrooms */}
        <div className="w-[calc(50%-6px)] sm:w-auto sm:min-w-[100px]">
          <label className="block font-mono text-xs text-neutral mb-1.5 uppercase">
            Beds
          </label>
          <SelectDropdown
            value={filters.bedrooms}
            onChange={(value) => updateFilter('bedrooms', value)}
            options={bedroomOptions}
            placeholder="All"
          />
        </div>

        {/* Bathrooms */}
        <div className="w-[calc(50%-6px)] sm:w-auto sm:min-w-[100px]">
          <label className="block font-mono text-xs text-neutral mb-1.5 uppercase">
            Baths
          </label>
          <SelectDropdown
            value={filters.bathrooms}
            onChange={(value) => updateFilter('bathrooms', value)}
            options={bathroomOptions}
            placeholder="All"
          />
        </div>

        {/* Price Range */}
        <div className="w-full sm:w-auto">
          <label className="block font-mono text-xs text-neutral mb-1.5 uppercase">
            Price Range
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={filters.priceMin}
              onChange={(e) => updateFilter('priceMin', e.target.value)}
              placeholder="Min ₹"
              className="w-24 px-3 py-3 bg-white border border-cream-dark rounded-lg font-mono text-sm text-dark placeholder:text-neutral focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
            />
            <input
              type="text"
              value={filters.priceMax}
              onChange={(e) => updateFilter('priceMax', e.target.value)}
              placeholder="Max ₹"
              className="w-24 px-3 py-3 bg-white border border-cream-dark rounded-lg font-mono text-sm text-dark placeholder:text-neutral focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
            />
          </div>
        </div>

        {/* Area Range */}
        <div className="w-full sm:w-auto">
          <label className="block font-mono text-xs text-neutral mb-1.5 uppercase">
            Area Range
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={filters.areaMin}
              onChange={(e) => updateFilter('areaMin', e.target.value)}
              placeholder="Min sqft"
              className="w-24 px-3 py-3 bg-white border border-cream-dark rounded-lg font-mono text-sm text-dark placeholder:text-neutral focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
            />
            <input
              type="text"
              value={filters.areaMax}
              onChange={(e) => updateFilter('areaMax', e.target.value)}
              placeholder="Max sqft"
              className="w-24 px-3 py-3 bg-white border border-cream-dark rounded-lg font-mono text-sm text-dark placeholder:text-neutral focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
            />
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={onSearch}
          className="w-full sm:w-auto px-8 py-3 bg-gold text-dark font-body font-semibold rounded-lg hover:bg-gold-dark transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" />
          Search
        </button>
      </div>

      {/* Active Filters & Clear */}
      {activeFilterCount > 0 && (
        <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-cream-dark">
          <div className="flex items-center gap-2">
            <div className="relative">
              <RotateCcw className="w-4 h-4 text-neutral" />
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gold text-dark font-mono text-[10px] font-bold rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            </div>
          </div>
          <button
            onClick={clearAllFilters}
            className="font-mono text-sm text-neutral hover:text-gold transition-colors"
          >
            Clear All
          </button>
        </div>
      )}
    </motion.div>
  )
}

export default PropertyFilters
