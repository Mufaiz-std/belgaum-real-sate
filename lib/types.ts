// Property types for BelgaumRealEstate.in
// TODO: Replace with API types from backend

export interface Property {
  id: string
  slug: string
  title: string
  area: string
  city: string
  propertyType: 'HOUSE' | 'APARTMENT' | 'FLAT' | 'BUNGALOW' | 'VILLA' | 'PLOT' | 'COMMERCIAL' | 'AGRICULTURAL' | string
  priceMin: number
  priceMax: number
  bedrooms: number | null
  bathrooms: number | null
  areaSqft: number | null
  badge: 'FEATURED' | 'NEW' | 'HOT' | 'SOLD' | null
  isFeatured: boolean
  coverImage: string
  status: 'ACTIVE' | 'SOLD' | 'PENDING'
  isNegotiable?: boolean
  isFree?: boolean
  isPricePerSqFt?: boolean
  dimensions?: string | null
  listedDateRaw?: string | null
  instagramLink?: string | null
  createdAt?: string | Date
}

export interface PropertyDetails extends Property {
  floor: number | null
  totalFloors: number | null
  propertyAge: string | null
  furnished: 'UNFURNISHED' | 'SEMI_FURNISHED' | 'FULLY_FURNISHED' | null
  parking: number | null
  description: string
  amenities: string[]
  images: string[]
  // These fields only returned by API for unlocked users:
  address: string | null
  landmark: string | null
  latitude: number | null
  longitude: number | null
  ownerName: string | null
  ownerPhone: string | null
  ownerWhatsapp: string | null
}

// Access levels — check server-side in production
export type AccessLevel = 'GUEST' | 'REGISTERED' | 'UNLOCKED' | 'SUBSCRIBER_LOCKED'
