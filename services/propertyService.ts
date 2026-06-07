import { prisma } from '@/lib/prisma'
import { PropertyStatus, PropertyType, Prisma } from '@prisma/client'

export interface PropertyFilters {
  area?: string
  propertyType?: PropertyType
  priceMin?: number
  priceMax?: number
  bedrooms?: number
  furnished?: string
  status?: PropertyStatus
  search?: string
  isFeatured?: boolean
  page?: number
  limit?: number
  sortBy?: 'newest' | 'price_asc' | 'price_desc'
}

type AccessLevel = 'GUEST' | 'REGISTERED' | 'UNLOCKED' | 'SUBSCRIBER'

export function sanitizeProperty(
  property: {
    id: string
    slug: string
    title: string
    area: string
    city: string
    propertyType: PropertyType
    priceMin: number
    priceMax: number
    areaSqft: number | null
    bedrooms: number | null
    bathrooms: number | null
    balconies: number | null
    parking: number | null
    floor: number | null
    totalFloors: number | null
    propertyAge: string | null
    furnished: string | null
    isFeatured: boolean
    status: PropertyStatus
    description: string
    address?: string | null
    latitude?: number | null
    longitude?: number | null
    createdAt: Date
    amenities: { name: string }[]
    images: { imageUrl: string; sortOrder: number }[]
    owner?: { name: string | null; phone?: string } | null
  },
  accessLevel: AccessLevel
) {
  const imageList = property.images.map((img) => img.imageUrl)

  const base = {
    id: property.id,
    slug: property.slug,
    title: property.title,
    area: property.area,
    city: property.city,
    propertyType: property.propertyType,
    priceMin: property.priceMin,
    priceMax: property.priceMax,
    areaSqft: property.areaSqft,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    balconies: property.balconies,
    parking: property.parking,
    floor: property.floor,
    totalFloors: property.totalFloors,
    propertyAge: property.propertyAge,
    furnished: property.furnished,
    isFeatured: property.isFeatured,
    status: property.status,
    description: property.description,
    amenities: property.amenities.map((a) => a.name),
    badge: property.isFeatured ? ('FEATURED' as const) : null,
    createdAt: property.createdAt,
    coverImage: imageList[0] ?? null,
    images:
      accessLevel === 'GUEST' || accessLevel === 'REGISTERED'
        ? imageList.slice(0, 1)
        : imageList,
  }

  if (accessLevel === 'UNLOCKED' || accessLevel === 'SUBSCRIBER') {
    return {
      ...base,
      address: property.address,
      latitude: property.latitude,
      longitude: property.longitude,
      ownerName: property.owner?.name,
      ownerPhone: property.owner?.phone,
      ownerWhatsapp: property.owner?.phone,
    }
  }

  return base
}

export async function getProperties(filters: PropertyFilters) {
  const page = filters.page ?? 1
  const limit = filters.limit ?? 12
  const skip = (page - 1) * limit

  const where: Prisma.PropertyWhereInput = {
    status: filters.status ?? 'ACTIVE',
    ...(filters.area && { area: { contains: filters.area, mode: 'insensitive' } }),
    ...(filters.propertyType && { propertyType: filters.propertyType }),
    ...(filters.priceMin && { priceMin: { gte: filters.priceMin } }),
    ...(filters.priceMax && { priceMax: { lte: filters.priceMax } }),
    ...(filters.bedrooms && { bedrooms: filters.bedrooms }),
    ...(filters.isFeatured !== undefined && { isFeatured: filters.isFeatured }),
    ...(filters.search && {
      OR: [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { area: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ],
    }),
  }

  const orderBy: Prisma.PropertyOrderByWithRelationInput =
    filters.sortBy === 'price_asc'
      ? { priceMin: 'asc' }
      : filters.sortBy === 'price_desc'
        ? { priceMin: 'desc' }
        : { createdAt: 'desc' }

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        amenities: true,
        owner: { select: { name: true } },
      },
    }),
    prisma.property.count({ where }),
  ])

  return {
    properties,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  }
}

export async function getPropertyBySlug(slug: string) {
  return prisma.property.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      amenities: true,
      owner: {
        select: { id: true, name: true, phone: true },
      },
    },
  })
}

export async function incrementViewCount(propertyId: string) {
  await prisma.property.update({
    where: { id: propertyId },
    data: { viewCount: { increment: 1 } },
  })
}
