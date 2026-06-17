'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, ShieldCheck, MapPin, Phone } from 'lucide-react'
import Image from 'next/image'



const statuses = ['For Sale', 'For Rent']

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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Ken Burns Effect */}
      <div className="absolute inset-0 z-0">
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
          Belgaum &gt; Zero Brokerage Property Marketplace
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
              defaultValue=""
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
              defaultValue=""
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

            <select
              className="flex-1 px-4 py-3 bg-cream-dark/50 rounded-lg font-body text-dark border-0 focus:ring-2 focus:ring-gold focus:outline-none appearance-none cursor-pointer"
              defaultValue=""
            >
              <option value="" disabled>
                Status
              </option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <button className="px-6 py-3 bg-gold hover:bg-gold-light text-dark font-body font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 shrink-0">
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
