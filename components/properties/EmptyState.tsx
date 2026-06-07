'use client'

import { motion } from 'framer-motion'
import { Home, Search } from 'lucide-react'
import Link from 'next/link'

interface EmptyStateProps {
  onClearFilters: () => void
}

export function EmptyState({ onClearFilters }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      {/* Illustration */}
      <div className="relative mb-8">
        <div className="w-32 h-32 bg-cream rounded-full flex items-center justify-center">
          <Home className="w-16 h-16 text-neutral/50" strokeWidth={1.5} />
        </div>
        <div className="absolute -bottom-2 -right-2 w-14 h-14 bg-gold/20 rounded-full flex items-center justify-center">
          <Search className="w-7 h-7 text-gold" />
        </div>
      </div>

      {/* Text */}
      <h3 className="font-display text-2xl text-dark mb-3">
        No properties found
      </h3>
      <p className="font-body text-neutral max-w-md mb-8">
        Try adjusting your filters or search in a different area to find the
        perfect property for you.
      </p>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
          onClick={onClearFilters}
          className="px-6 py-3 bg-gold text-dark font-body font-semibold rounded-lg hover:bg-gold-dark transition-colors duration-200"
        >
          Clear Filters
        </button>
        <Link
          href="/"
          className="px-6 py-3 border border-cream-dark text-neutral font-body rounded-lg hover:border-gold hover:text-gold transition-colors duration-200"
        >
          Back to Home
        </Link>
      </div>
    </motion.div>
  )
}

export default EmptyState
