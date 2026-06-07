'use client'

import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10">
      {/* Items count */}
      <p className="font-mono text-sm text-neutral">
        Showing {startItem}-{endItem} of {totalItems} properties
      </p>

      {/* Page navigation */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-2 rounded-lg font-body text-sm border border-cream-dark text-neutral hover:border-gold hover:text-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-cream-dark disabled:hover:text-neutral transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </motion.button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) =>
            page === '...' ? (
              <span
                key={`ellipsis-${index}`}
                className="px-2 py-2 font-mono text-sm text-neutral"
              >
                ...
              </span>
            ) : (
              <motion.button
                key={page}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onPageChange(page as number)}
                className={`w-10 h-10 rounded-lg font-mono text-sm transition-colors ${
                  currentPage === page
                    ? 'bg-gold text-dark font-bold'
                    : 'bg-white border border-cream-dark text-neutral hover:border-gold hover:text-gold'
                }`}
                aria-label={`Page ${page}`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </motion.button>
            )
          )}
        </div>

        {/* Next button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-3 py-2 rounded-lg font-body text-sm border border-cream-dark text-neutral hover:border-gold hover:text-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-cream-dark disabled:hover:text-neutral transition-colors"
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  )
}

export default Pagination
