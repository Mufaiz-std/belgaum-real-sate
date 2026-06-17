'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  ChevronRight,
  Share2,
  Bookmark,
  Bed,
  Bath,
  Maximize2,
  Car,
  Layers,
  Calendar,
  Sofa,
  FileCheck,
  Zap,
  Shield,
  ArrowUpDown,
  Trees,
  Building,
  Dumbbell,
  Waves,
  Lock,
  Camera,
  Droplets,
} from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import PropertyGallery from '@/components/properties/PropertyGallery'
import ContactCard from '@/components/properties/ContactCard'
import { UpgradeModal } from '@/components/shared/UpgradeModal'
import { PropertyCard } from '@/components/properties/PropertyCard'
import { AccessLevel, PropertyDetails } from '@/lib/types'

// Dynamic import for map (no SSR)
const PropertyMap = dynamic(
  () => import('@/components/properties/PropertyMap'),
  { ssr: false }
)

const amenityIcons: Record<string, typeof Zap> = {
  'Power Backup': Zap,
  Security: Shield,
  Lift: ArrowUpDown,
  Park: Trees,
  'Club House': Building,
  Gym: Dumbbell,
  'Swimming Pool': Waves,
  'Gated Community': Lock,
  CCTV: Camera,
  'Water Supply 24/7': Droplets,
}

const furnishedLabels: Record<string, string> = {
  UNFURNISHED: 'Unfurnished',
  SEMI_FURNISHED: 'Semi-furnished',
  FULLY_FURNISHED: 'Fully Furnished',
}



function formatPrice(price: number): string {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`
  } else if (price >= 100000) {
    return `₹${(price / 100000).toFixed(0)},00,000`
  }
  return `₹${price.toLocaleString('en-IN')}`
}

interface PropertyDetailsClientProps {
  property: PropertyDetails
  relatedProperties: any[]
  accessLevel: AccessLevel
  isAdmin?: boolean
  initialSaved?: boolean
}

export default function PropertyDetailsClient({
  property,
  relatedProperties,
  accessLevel,
  isAdmin,
  initialSaved = false,
}: PropertyDetailsClientProps) {
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)
  const [saved, setSaved] = useState(initialSaved)
  const [isSaving, setIsSaving] = useState(false)

  const isLocked = accessLevel === 'GUEST' || accessLevel === 'REGISTERED'

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: property.title,
        text: `Check out this property: ${property.title}`,
        url: window.location.href,
      })
    } else {
      await navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const handleToggleSave = async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      const res = await fetch(`/api/properties/${property.id}/save`, {
        method: 'POST',
      })
      if (!res.ok) {
        if (res.status === 401) {
          alert('Please login to save properties.')
          return
        }
        throw new Error('Failed to toggle save')
      }
      const data = await res.json()
      setSaved(data.saved)
    } catch (error) {
      console.error(error)
      alert('An error occurred while saving the property.')
    } finally {
      setIsSaving(false)
    }
  }

  const keyDetails = [
    {
      label: 'Bedrooms',
      value: property.bedrooms ? `${property.bedrooms} BHK` : 'N/A',
      icon: Bed,
    },
    {
      label: 'Bathrooms',
      value: property.bathrooms?.toString() || 'N/A',
      icon: Bath,
    },
    {
      label: 'Area',
      value: property.areaSqft ? `${property.areaSqft.toLocaleString()} sqft` : 'N/A',
      icon: Maximize2,
    },
    {
      label: 'Parking',
      value: property.parking ? `${property.parking} Covered` : 'N/A',
      icon: Car,
    },
    {
      label: 'Floor',
      value:
        property.floor && property.totalFloors
          ? `${property.floor}${getOrdinalSuffix(property.floor)} of ${property.totalFloors}`
          : 'N/A',
      icon: Layers,
    },
    {
      label: 'Property Age',
      value: property.propertyAge || 'N/A',
      icon: Calendar,
    },
    {
      label: 'Furnished',
      value: property.furnished ? furnishedLabels[property.furnished] : 'N/A',
      icon: Sofa,
    },
    {
      label: 'Ownership',
      value: 'Freehold',
      icon: FileCheck,
    },
  ]

  function getOrdinalSuffix(n: number): string {
    const s = ['th', 'st', 'nd', 'rd']
    const v = n % 100
    return s[(v - 20) % 10] || s[v] || s[0]
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 font-mono text-sm text-neutral mb-6 overflow-x-auto whitespace-nowrap"
          >
            <Link href="/" className="hover:text-gold transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-gold flex-shrink-0" />
            <Link href="/properties" className="hover:text-gold transition-colors">
              {property.propertyType}
            </Link>
            <ChevronRight className="w-4 h-4 text-gold flex-shrink-0" />
            <span className="hover:text-gold transition-colors">
              {property.area}
            </span>
            <ChevronRight className="w-4 h-4 text-gold flex-shrink-0" />
            <span className="text-dark truncate">{property.title}</span>
          </motion.nav>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-[1fr_380px] gap-8">
            {/* Left Column - Main Content */}
            <div className="space-y-8">
              {/* Image Gallery */}
              <PropertyGallery
                images={property.images}
                title={property.title}
                accessLevel={accessLevel}
                onUnlockClick={() => setUpgradeModalOpen(true)}
              />

              {/* Property Info Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="font-display text-2xl md:text-3xl text-dark">
                        {property.title}
                      </h1>
                      <span
                        className={`px-3 py-1 rounded-full font-mono text-xs font-bold ${
                          property.status === 'ACTIVE'
                            ? 'bg-success/20 text-success'
                            : 'bg-neutral/20 text-neutral'
                        }`}
                      >
                        {property.status}
                      </span>
                    </div>
                    <p className="font-mono text-sm text-neutral">
                      {property.area}, {property.city}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <Link
                        href={`/admin/properties/${property.id}/edit`}
                        className="px-4 py-2 border border-gold text-gold font-body font-medium rounded-lg hover:bg-gold hover:text-dark transition-colors"
                      >
                        Edit Property
                      </Link>
                    )}
                    <button
                      onClick={handleShare}
                      className="p-3 rounded-lg border border-cream-dark hover:border-gold hover:text-gold transition-colors"
                      aria-label="Share property"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleToggleSave}
                      disabled={isSaving}
                      className={`p-3 rounded-lg border transition-colors ${
                        saved
                          ? 'border-gold bg-gold/10 text-gold'
                          : 'border-cream-dark hover:border-gold hover:text-gold'
                      } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                      aria-label={saved ? 'Remove from saved' : 'Save property'}
                    >
                      <Bookmark className={`w-5 h-5 ${saved ? 'fill-gold' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <p className="font-mono text-xs text-neutral uppercase mb-1">
                    {property.priceMin === property.priceMax ? 'Price' : 'Price Range'}
                  </p>
                  <p className="font-mono text-3xl text-gold font-bold flex items-baseline gap-3">
                    {property.priceMin === property.priceMax 
                      ? formatPrice(property.priceMin) 
                      : `${formatPrice(property.priceMin)} – ${formatPrice(property.priceMax)}`}
                    {property.isNegotiable && (
                      <span className="text-lg font-body font-normal text-neutral">(Negotiable)</span>
                    )}
                  </p>
                </div>

                {/* Key Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {keyDetails.map((detail) => (
                    <div
                      key={detail.label}
                      className="bg-cream/50 rounded-lg p-4 border border-cream-dark"
                    >
                      <detail.icon className="w-5 h-5 text-gold mb-2" />
                      <p className="font-mono text-xs text-neutral uppercase mb-1">
                        {detail.label}
                      </p>
                      <p className="font-body font-semibold text-dark">
                        {detail.value}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="font-display text-xl text-dark mb-4">
                  About this property
                </h2>
                <p className="font-body text-dark/80 leading-relaxed">
                  {property.description}
                </p>
              </motion.div>

              {/* Amenities */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="font-display text-xl text-dark mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities.map((amenity) => {
                    const IconComponent = amenityIcons[amenity] || Zap
                    return (
                      <div
                        key={amenity}
                        className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 border border-cream-dark"
                      >
                        <IconComponent className="w-5 h-5 text-gold flex-shrink-0" />
                        <span className="font-body text-sm text-dark">{amenity}</span>
                      </div>
                    )
                  })}
                </div>
              </motion.div>

              {/* Location */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="font-display text-xl text-dark mb-4">Location</h2>

                {isLocked ? (
                  <div className="relative rounded-xl overflow-hidden">
                    {/* Blurred Map Placeholder */}
                    <div className="relative h-64">
                      <Image
                        src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800"
                        alt="Map placeholder"
                        fill
                        className="object-cover blur-sm"
                      />
                      <div className="absolute inset-0 bg-dark/40 flex flex-col items-center justify-center">
                        <Lock className="w-8 h-8 text-gold mb-3" />
                        <p className="font-body text-white text-center">
                          Unlock to view exact location on map
                        </p>
                        <p className="font-mono text-sm text-white/70 mt-1">
                          {property.area}, {property.city}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <PropertyMap
                    latitude={property.latitude ?? 15.8497}
                    longitude={property.longitude ?? 74.4977}
                    address={property.address || `${property.area}, ${property.city}`}
                  />
                )}
              </motion.div>
            </div>

            {/* Right Column - Contact Card */}
            <div className="lg:order-last">
              <ContactCard
                accessLevel={accessLevel}
                ownerName={property.ownerName}
                ownerPhone={property.ownerPhone}
                ownerWhatsapp={property.ownerWhatsapp}
                propertyId={property.id}
                isFree={property.isFree}
                onUnlockClick={() => setUpgradeModalOpen(true)}
              />
            </div>
          </div>

          {/* Related Properties */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16"
          >
            <h2 className="font-display text-2xl text-dark mb-8 text-center">
              Similar Properties
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProperties.map((prop, index) => (
                <PropertyCard
                  key={prop.id}
                  property={{
                    id: prop.id,
                    title: prop.title,
                    area: prop.area,
                    priceMin: prop.priceMin,
                    priceMax: prop.priceMax,
                    beds: prop.bedrooms || 0,
                    baths: prop.bathrooms || 0,
                    sqft: prop.areaSqft || 0,
                    type: prop.propertyType,
                    badge: prop.badge,
                    image: prop.coverImage,
                    isNegotiable: prop.isNegotiable,
                  }}
                  index={index}
                />
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                href={`/properties?type=${property.propertyType}`}
                className="inline-flex items-center gap-2 px-6 py-3 border border-gold text-gold font-body font-semibold rounded-lg hover:bg-gold hover:text-dark transition-colors"
              >
                View More Like This
              </Link>
            </div>
          </motion.section>
        </div>
      </main>

      <Footer />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        propertyId={property.id}
      />
    </div>
  )
}
