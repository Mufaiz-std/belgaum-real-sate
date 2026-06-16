import HomePage from '@/components/home/HomePage'
import { LocalBusinessSchema } from '@/components/seo/LocalBusinessSchema'
import { prisma } from '@/lib/prisma'
import type { Property as DBProperty } from '@prisma/client'

// Map database property to PropertyCard's Property interface
function mapPropertyToCard(dbProp: any) {
  let badge: 'FEATURED' | 'NEW' | 'HOT' | 'SOLD' | undefined = undefined
  
  // Badge Logic: 
  // 1. Featured on top
  // 2. Hot/New based on views/date
  if (dbProp.status === 'SOLD') {
    badge = 'SOLD'
  } else if (dbProp.isFeatured) {
    badge = 'FEATURED'
  } else {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    if (dbProp.viewCount > 100) {
      badge = 'HOT'
    } else if (dbProp.createdAt > sevenDaysAgo) {
      badge = 'NEW'
    }
  }

  const image = dbProp.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600'

  return {
    id: dbProp.id,
    title: dbProp.title,
    area: dbProp.area,
    priceMin: dbProp.priceMin,
    priceMax: dbProp.priceMax,
    beds: dbProp.bedrooms || 0,
    baths: dbProp.bathrooms || 0,
    sqft: dbProp.areaSqft || 0,
    type: dbProp.propertyType,
    badge,
    image,
  }
}

export const revalidate = 0 // Disable cache for the homepage to always get fresh properties

export default async function Page() {
  const dbProperties = await prisma.property.findMany({
    where: {
      status: 'ACTIVE'
    },
    include: {
      images: {
        orderBy: { sortOrder: 'asc' },
        take: 1
      }
    },
    orderBy: [
      { isFeatured: 'desc' }, // Featured properties come first
      { createdAt: 'desc' }   // Then order by newest
    ]
  })

  const properties = dbProperties.map(mapPropertyToCard)

  return (
    <>
      <LocalBusinessSchema />
      <HomePage properties={properties} />
    </>
  )
}
