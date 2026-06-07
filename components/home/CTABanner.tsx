'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function CTABanner() {
  return (
    <section className="bg-cream py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16"
        >
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">
            <h2 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-semibold text-dark mb-2">
              Direct from owner.
            </h2>
            <h2 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-semibold text-gold italic mb-6">
              Always.
            </h2>
            <p className="font-body text-neutral text-lg max-w-xl leading-relaxed">
              No middlemen, no brokerage, no surprise charges. Just verified
              Belagavi properties with direct owner contact.
            </p>
          </div>

          {/* Right Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-dark text-white font-body font-semibold rounded-xl hover:bg-dark-card transition-colors duration-200"
            >
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/properties"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-gold text-gold font-body font-semibold rounded-xl hover:bg-gold/10 transition-colors duration-200"
            >
              Browse Listings
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default CTABanner
