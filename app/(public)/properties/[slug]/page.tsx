import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession, getAccessLevel } from '@/lib/auth'
import PropertyDetailsClient from './PropertyDetailsClient'
import { AccessLevel, PropertyDetails } from '@/lib/types'

interface PropertyDetailsPageProps {
  params: Promise<{ slug: string }>
}

export default async function PropertyDetailsPage({ params }: PropertyDetailsPageProps) {
  const resolvedParams = await params
  const property = await prisma.property.findUnique({
    where: { slug: resolvedParams.slug },
    include: { owner: true, images: true, amenities: true },
  })

  if (!property) {
    notFound()
  }

  const session = await getSession()

  let accessLevel: AccessLevel = 'GUEST'

  if (session) {
    // Admins always see everything — no subscription needed
    if (session.role === 'ADMIN' || session.userId === property.ownerId) {
      accessLevel = 'UNLOCKED'
    } else {
      // Use the shared helper which checks subscription & per-property unlocks
      accessLevel = await getAccessLevel(session.userId, property.id)
    }
  }

  // Map Prisma model to PropertyDetails interface
  const mappedProperty: PropertyDetails = {
    id: property.id,
    slug: property.slug,
    title: property.title,
    area: property.area,
    city: property.city,
    propertyType: property.propertyType as any,
    priceMin: property.priceMin,
    priceMax: property.priceMax,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    areaSqft: property.areaSqft,
    badge: null,
    isFeatured: false,
    coverImage: property.images[0]?.imageUrl || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    status: property.status as any,
    floor: property.floor,
    totalFloors: property.totalFloors,
    propertyAge: property.propertyAge,
    furnished: property.furnished as any,
    parking: property.parking,
    description: property.description,
    amenities: property.amenities.map(a => a.name),
    images: property.images.length > 0 ? property.images.map(img => img.imageUrl) : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'],
    
    // Private details shown if unlocked
    address: (accessLevel === 'UNLOCKED' || accessLevel === 'SUBSCRIBER') ? property.address : null,
    latitude: (accessLevel === 'UNLOCKED' || accessLevel === 'SUBSCRIBER') ? property.latitude : null,
    longitude: (accessLevel === 'UNLOCKED' || accessLevel === 'SUBSCRIBER') ? property.longitude : null,
    ownerName: (accessLevel === 'UNLOCKED' || accessLevel === 'SUBSCRIBER') ? (property.owner.name || 'Owner') : null,
    ownerPhone: (accessLevel === 'UNLOCKED' || accessLevel === 'SUBSCRIBER') ? (property.contactNumber || property.owner.phone) : null,
    ownerWhatsapp: (accessLevel === 'UNLOCKED' || accessLevel === 'SUBSCRIBER') ? (property.whatsappNumber || property.owner.phone) : null,
  }

  // Fetch related properties
  const relatedPropertiesDb = await prisma.property.findMany({
    where: {
      propertyType: property.propertyType,
      id: { not: property.id },
      status: 'ACTIVE',
    },
    take: 3,
    include: { images: true },
  })

  const mappedRelated = relatedPropertiesDb.map(p => ({
    id: p.id,
    title: p.title,
    area: p.area,
    priceMin: p.priceMin,
    priceMax: p.priceMax,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    areaSqft: p.areaSqft,
    propertyType: p.propertyType,
    badge: null,
    coverImage: p.images[0]?.imageUrl || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
  }))

  return (
    <PropertyDetailsClient 
      property={mappedProperty} 
      relatedProperties={mappedRelated} 
      accessLevel={accessLevel} 
    />
  )
}
