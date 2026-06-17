'use client'

import { useState, useEffect } from 'react'
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

interface Category {
  id: string
  label: string
  icon: any
  count: string
}

interface CategoryTabsProps {
  onCategoryChange?: (category: string) => void
}

export function CategoryTabs({ onCategoryChange }: CategoryTabsProps) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [categories, setCategories] = useState<Category[]>([
    { id: 'all', label: 'All Properties', icon: Building2, count: 'Explore' }
  ])

  useEffect(() => {
    fetch('/api/public/settings')
      .then(res => res.json())
      .then(data => {
        if (data.propertyTypes) {
          const typeIconMap: Record<string, any> = {
            FLAT: Building,
            HOUSE: Home,
            PLOT: LayoutGrid,
            BUNGALOW: Castle,
            COMMERCIAL: Briefcase,
            VILLA: Castle,
          }
          const dynamicCategories = data.propertyTypes.map((t: any) => ({
            id: t.name,
            label: t.name,
            icon: typeIconMap[t.name.toUpperCase()] || Building2,
            count: 'Explore'
          }))
          
          setCategories([
            { id: 'all', label: 'All Properties', icon: Building2, count: 'Explore' },
            ...dynamicCategories
          ])
        }
      })
      .catch(console.error)
  }, [])

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
          <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-3 pb-4">
            {categories.map((category) => {
              const Icon = category.icon
              const isActive = activeCategory === category.id

              return (
                <motion.button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`relative flex flex-col items-center justify-center gap-1 sm:gap-2 p-2 sm:px-6 sm:py-4 rounded-xl transition-all duration-300 text-center ${
                    isActive
                      ? 'bg-dark text-white'
                      : 'bg-cream text-dark hover:bg-cream-dark'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon
                    className={`w-5 h-5 sm:w-6 sm:h-6 ${
                      isActive ? 'text-gold' : 'text-neutral'
                    }`}
                  />
                  <span className="font-body font-medium text-[10px] leading-tight sm:text-sm">
                    {category.label}
                  </span>
                  <span
                    className={`hidden sm:block font-mono text-xs ${
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
