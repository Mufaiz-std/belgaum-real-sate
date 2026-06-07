'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Building2,
  Building,
  Home,
  LayoutGrid,
  Castle,
  Briefcase,
  Tractor,
  ArrowRight,
} from 'lucide-react'

const categories = [
  { id: 'all', label: 'All Properties', icon: Building2, count: '8,500+' },
  { id: 'flat', label: 'Flats', icon: Building, count: '3,240+' },
  { id: 'house', label: 'Houses', icon: Home, count: '1,850+' },
  { id: 'plot', label: 'Plots', icon: LayoutGrid, count: '1,420+' },
  { id: 'bungalow', label: 'Bungalow', icon: Castle, count: '680+' },
  { id: 'commercial', label: 'Commercial', icon: Briefcase, count: '890+' },
  { id: 'agricultural', label: 'Agricultural', icon: Tractor, count: '420+' },
]

interface CategoryTabsProps {
  onCategoryChange?: (category: string) => void
}

export function CategoryTabs({ onCategoryChange }: CategoryTabsProps) {
  const [activeCategory, setActiveCategory] = useState('all')

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId)
    onCategoryChange?.(categoryId)
  }

  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-headline text-2xl sm:text-3xl font-semibold text-dark">
            What are you looking for?
          </h2>
          <Link
            href="/properties"
            className="hidden sm:flex items-center gap-2 text-gold font-body font-medium hover:text-gold-dark transition-colors"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Tabs */}
        <div className="relative">
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
            {categories.map((category) => {
              const Icon = category.icon
              const isActive = activeCategory === category.id

              return (
                <motion.button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`relative flex flex-col items-center gap-2 px-6 py-4 rounded-xl transition-all duration-300 shrink-0 min-w-[120px] ${
                    isActive
                      ? 'bg-dark text-white'
                      : 'bg-cream text-dark hover:bg-cream-dark'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      isActive ? 'text-gold' : 'text-neutral'
                    }`}
                  />
                  <span className="font-body font-medium text-sm">
                    {category.label}
                  </span>
                  <span
                    className={`font-mono text-xs ${
                      isActive ? 'text-cream/70' : 'text-neutral'
                    }`}
                  >
                    {category.count} Properties
                  </span>

                  {/* Animated underline */}
                  {isActive && (
                    <motion.div
                      layoutId="categoryUnderline"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-gold rounded-t-full"
                      transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Mobile View All Link */}
        <div className="sm:hidden mt-4">
          <Link
            href="/properties"
            className="flex items-center justify-center gap-2 text-gold font-body font-medium hover:text-gold-dark transition-colors"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default CategoryTabs
