'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ShieldCheck, MapPin, Phone, ChevronDown, IndianRupee } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'



// const statuses = ['For Sale', 'For Rent']

const priceOptions = [
  { label: 'No Min', value: '' },
  { label: '₹5 Lac', value: '500000' },
  { label: '₹10 Lac', value: '1000000' },
  { label: '₹20 Lac', value: '2000000' },
  { label: '₹30 Lac', value: '3000000' },
  { label: '₹40 Lac', value: '4000000' },
  { label: '₹50 Lac', value: '5000000' },
  { label: '₹60 Lac', value: '6000000' },
  { label: '₹75 Lac', value: '7500000' },
  { label: '₹1 Cr', value: '10000000' },
  { label: '₹1.5 Cr', value: '15000000' },
  { label: '₹2 Cr', value: '20000000' },
  { label: '₹3 Cr', value: '30000000' },
  { label: '₹5 Cr', value: '50000000' },
]

const maxPriceOptions = [
  { label: 'No Max', value: '' },
  { label: '₹10 Lac', value: '1000000' },
  { label: '₹20 Lac', value: '2000000' },
  { label: '₹30 Lac', value: '3000000' },
  { label: '₹40 Lac', value: '4000000' },
  { label: '₹50 Lac', value: '5000000' },
  { label: '₹75 Lac', value: '7500000' },
  { label: '₹1 Cr', value: '10000000' },
  { label: '₹1.5 Cr', value: '15000000' },
  { label: '₹2 Cr', value: '20000000' },
  { label: '₹3 Cr', value: '30000000' },
  { label: '₹5 Cr+', value: '50000000' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut' as const,
    },
  },
}

const wordVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
  },
}

export function HeroBanner() {
  const headlineWords = ['Discover', 'Your', 'Extraordinary', 'Home']
  const [propertyTypes, setPropertyTypes] = useState<string[]>(['All Types'])
  const [locations, setLocations] = useState<string[]>(['All Areas'])
  
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const router = useRouter()

  // Budget dropdown state
  const [budgetOpen, setBudgetOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'min' | 'max'>('min')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const budgetRef = useRef<HTMLDivElement>(null)

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (selectedLocation && selectedLocation !== 'All Areas') params.set('search', selectedLocation)
    if (selectedType && selectedType !== 'All Types') params.set('type', selectedType)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    
    router.push(`/properties?${params.toString()}`)
  }

  // Close budget dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (budgetRef.current && !budgetRef.current.contains(e.target as Node)) {
        setBudgetOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const budgetLabel = () => {
    if (!minPrice && !maxPrice) return 'Budget'
    if (minPrice && maxPrice) {
      const minLabel = priceOptions.find(p => p.value === minPrice)?.label ?? ''
      const maxLabel = maxPriceOptions.find(p => p.value === maxPrice)?.label ?? ''
      return `${minLabel} – ${maxLabel}`
    }
    if (minPrice) return `Min ${priceOptions.find(p => p.value === minPrice)?.label}`
    if (maxPrice) return `Max ${maxPriceOptions.find(p => p.value === maxPrice)?.label}`
    return 'Budget'
  }

  useEffect(() => {
    fetch('/api/public/settings')
      .then(res => res.json())
      .then(data => {
        if (data.propertyTypes) {
          setPropertyTypes(['All Types', ...data.propertyTypes.map((t: any) => t.name)])
        }
        if (data.areas) {
          setLocations(['All Areas', ...data.areas.map((a: any) => a.name)])
        }
      })
      .catch(console.error)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center">
      {/* Background Image with Ken Burns Effect — overflow-hidden here, NOT on section */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="relative w-full h-full animate-kenburns">
          <Image
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600"
            alt="Luxury property in Belagavi"
            fill
            className="object-cover"
            priority
            sizes="100vw"
            unoptimized
          />
        </div>
        {/* Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(15,17,21,0.55) 0%, rgba(15,17,21,0.75) 60%, rgba(15,17,21,0.95) 100%)',
          }}
        />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Breadcrumb */}
        <motion.p
          className="font-mono text-gold text-sm mb-6"
          variants={itemVariants}
        >
          Xcity &gt; Zero Brokerage Property Marketplace
        </motion.p>

        {/* Headline */}
        <motion.h1
          className="font-headline text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6"
          variants={itemVariants}
        >
          <motion.span
            className="block"
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.1, delayChildren: 0.5 }}
          >
            {headlineWords.slice(0, 2).map((word, index) => (
              <motion.span
                key={index}
                className="inline-block mr-4"
                variants={wordVariants}
                transition={{ duration: 0.5 }}
              >
                {word}
              </motion.span>
            ))}
          </motion.span>
          <motion.span
            className="block text-balance"
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.1, delayChildren: 0.7 }}
          >
            {headlineWords.slice(2).map((word, index) => (
              <motion.span
                key={index}
                className="inline-block mr-4"
                variants={wordVariants}
                transition={{ duration: 0.5 }}
              >
                {word}
              </motion.span>
            ))}
          </motion.span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          className="font-body text-cream/70 text-base sm:text-lg max-w-2xl mx-auto mb-10 text-pretty"
          variants={itemVariants}
        >
          Browse verified properties across Belagavi — Flats, plots, houses,
          commercial. Unlock any listing for lifetime access, or go unlimited
          with a subscription.
        </motion.p>

        {/* Search Bar */}
        <motion.div
          className="bg-white rounded-xl shadow-2xl p-3 sm:p-4 max-w-3xl mx-auto"
          variants={itemVariants}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              className="flex-1 px-4 py-3 bg-cream-dark/50 rounded-lg font-body text-dark border-0 focus:ring-2 focus:ring-gold focus:outline-none appearance-none cursor-pointer"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <option value="" disabled>
                Location/Area
              </option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>

            <select
              className="flex-1 px-4 py-3 bg-cream-dark/50 rounded-lg font-body text-dark border-0 focus:ring-2 focus:ring-gold focus:outline-none appearance-none cursor-pointer"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="" disabled>
                Property Type
              </option>
              {propertyTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            {/* Status dropdown — hidden for now */}
            {/* <select
              className="flex-1 px-4 py-3 bg-cream-dark/50 rounded-lg font-body text-dark border-0 focus:ring-2 focus:ring-gold focus:outline-none appearance-none cursor-pointer"
              defaultValue=""
            >
              <option value="" disabled>Status</option>
              {statuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select> */}

            {/* MagicBricks-style Budget Dropdown */}
            <div className="relative flex-1" ref={budgetRef}>
              <button
                type="button"
                id="budget-dropdown-btn"
                onClick={() => setBudgetOpen(prev => !prev)}
                className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-cream-dark/50 rounded-lg font-body text-dark border-0 focus:ring-2 focus:ring-gold focus:outline-none cursor-pointer transition-colors hover:bg-cream-dark/70"
              >
                <span className="flex items-center gap-1.5">
                  <IndianRupee className="w-4 h-4 text-gold shrink-0" />
                  <span className={`truncate text-sm ${budgetLabel() === 'Budget' ? 'text-dark/50' : 'text-dark font-medium'}`}>
                    {budgetLabel()}
                  </span>
                </span>
                <ChevronDown className={`w-4 h-4 text-dark/50 shrink-0 transition-transform duration-200 ${budgetOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {budgetOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 z-[999] overflow-hidden"
                  >
                    {/* Tabs */}
                    <div className="flex border-b border-gray-100">
                      {(['min', 'max'] as const).map(tab => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setActiveTab(tab)}
                          className={`flex-1 py-3 text-sm font-semibold font-body transition-colors ${
                            activeTab === tab
                              ? 'text-gold border-b-2 border-gold bg-amber-50'
                              : 'text-dark/50 hover:text-dark hover:bg-gray-50'
                          }`}
                        >
                          {tab === 'min' ? 'Min Price' : 'Max Price'}
                        </button>
                      ))}
                    </div>

                    {/* Price List */}
                    <div className="max-h-52 overflow-y-auto overscroll-contain py-1">
                      {(activeTab === 'min' ? priceOptions : maxPriceOptions).map(opt => {
                        const isSelected = activeTab === 'min' ? minPrice === opt.value : maxPrice === opt.value
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              if (activeTab === 'min') { setMinPrice(opt.value); setActiveTab('max') }
                              else { setMaxPrice(opt.value); setBudgetOpen(false) }
                            }}
                            className={`w-full text-left px-5 py-2.5 text-sm font-body transition-colors ${
                              isSelected
                                ? 'bg-amber-50 text-gold font-semibold'
                                : 'text-dark hover:bg-gray-50'
                            }`}
                          >
                            {opt.label}
                          </button>
                        )
                      })}
                    </div>

                    {/* Reset */}
                    {(minPrice || maxPrice) && (
                      <div className="border-t border-gray-100 px-4 py-2">
                        <button
                          type="button"
                          onClick={() => { setMinPrice(''); setMaxPrice(''); setBudgetOpen(false) }}
                          className="text-xs text-dark/40 hover:text-red-500 transition-colors font-body"
                        >
                          ✕ Clear budget
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={handleSearch}
              className="px-6 py-3 bg-gold hover:bg-gold-light text-dark font-body font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 shrink-0"
            >
              <Search className="w-5 h-5" />
              <span>Search</span>
            </button>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-6 mt-6"
          variants={itemVariants}
        >
          <div className="flex items-center gap-2 text-cream/70 font-mono text-xs sm:text-sm">
            <ShieldCheck className="w-4 h-4 text-gold" />
            <span>No hidden charges</span>
          </div>
          <div className="flex items-center gap-2 text-cream/70 font-mono text-xs sm:text-sm">
            <MapPin className="w-4 h-4 text-gold" />
            <span>Exact location</span>
          </div>
          <div className="flex items-center gap-2 text-cream/70 font-mono text-xs sm:text-sm">
            <Phone className="w-4 h-4 text-gold" />
            <span>Pay once access</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}

export default HeroBanner
