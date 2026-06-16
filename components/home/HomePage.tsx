'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { HeroBanner } from '@/components/home/HeroBanner'
import { CategoryTabs } from '@/components/home/CategoryTabs'
import { FeaturedProperties } from '@/components/home/FeaturedProperties'
import { HowItWorks } from '@/components/home/HowItWorks'
import { StatsBar } from '@/components/home/StatsBar'
import { CTABanner } from '@/components/home/CTABanner'
import type { Property } from '@/components/properties/PropertyCard'

interface HomePageProps {
  properties: Property[]
}

export default function HomePage({ properties }: HomePageProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')

  return (
    <>
      <Header />
      <main>
        <HeroBanner />
        <CategoryTabs onCategoryChange={setSelectedCategory} />
        <FeaturedProperties categoryFilter={selectedCategory} properties={properties} />
        <HowItWorks />
        <StatsBar />
        <CTABanner />
      </main>
      <Footer />
    </>
  )
}
