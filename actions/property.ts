'use server'

import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'
import { geocodeAddress } from '@/lib/geocoding'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const propertyFormSchema = z.object({
  title: z.string().min(10).max(100),
  propertyType: z.string().min(1),
  transactionType: z.literal('SALE'),
  price: z.number().min(1),
  isPricePerSqFt: z.boolean().optional(),
  isNegotiable: z.boolean().optional(),
  isFree: z.boolean().optional(),
  area: z.string().min(1),
  fullAddress: z.string().min(10),
  landmark: z.string().optional(),
  dimensions: z.string().optional(),
  contactNumber: z.string().optional(),
  whatsappNumber: z.string().optional(),
  bedrooms: z.number().min(0).max(20).optional(),
  bathrooms: z.number().min(0).max(20).optional(),
  balconies: z.number().min(0).max(10).optional(),
  parking: z.number().min(0).max(10).optional(),
  floor: z.number().min(0).max(100).optional(),
  totalFloors: z.number().min(1).max(100).optional(),
  propertyAge: z.enum(['NEW', '1-5', '5-10', '10-20', '20+']).optional(),
  furnished: z.enum(['UNFURNISHED', 'SEMI_FURNISHED', 'FURNISHED']).optional(),
  description: z.string().max(500).optional(),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string()).min(0).max(10),
})

export type PropertyFormData = z.infer<typeof propertyFormSchema>

function generateSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() +
    '-' +
    Date.now()
  )
}

export async function submitProperty(formData: PropertyFormData) {
  const session = await requireAuth()
  const validated = propertyFormSchema.parse(formData)

  // Admins bypass the approval queue — their properties go live immediately
  const isAdmin = session.role === 'ADMIN'
  const propertyStatus = isAdmin ? 'ACTIVE' : 'PENDING'

  const addressToGeocode = validated.fullAddress || `${validated.area}, Belagavi`
  const coords = await geocodeAddress(addressToGeocode)

  const property = await prisma.property.create({
    data: {
      title: validated.title,
      propertyType: validated.propertyType,
      price: validated.price,
      priceMin: validated.price,
      priceMax: validated.price,
      isPricePerSqFt: validated.isPricePerSqFt || false,
      isNegotiable: validated.isNegotiable || false,
      isFree: validated.isFree || false,
      dimensions: validated.dimensions,
      area: validated.area,
      address: validated.fullAddress,
      landmark: validated.landmark,
      latitude: coords?.latitude,
      longitude: coords?.longitude,
      contactNumber: validated.contactNumber,
      whatsappNumber: validated.whatsappNumber,
      bedrooms: validated.bedrooms,
      bathrooms: validated.bathrooms,
      balconies: validated.balconies,
      parking: validated.parking,
      floor: validated.floor,
      totalFloors: validated.totalFloors,
      propertyAge: validated.propertyAge,
      furnished: validated.furnished,
      description: validated.description || '',
      ownerId: session.userId,
      status: propertyStatus,
      slug: generateSlug(validated.title),
    },
  })

  await prisma.propertyImage.createMany({
    data: validated.images.map((url, index) => ({
      propertyId: property.id,
      imageUrl: url,
      sortOrder: index,
    })),
  })

  if (validated.amenities?.length) {
    await prisma.propertyAmenity.createMany({
      data: validated.amenities.map((name) => ({
        propertyId: property.id,
        name,
      })),
    })
  }

  await createAuditLog({
    userId: session.userId,
    action: isAdmin ? 'PROPERTY_PUBLISHED' : 'PROPERTY_SUBMITTED',
    metadata: { propertyId: property.id, title: validated.title },
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/properties')
  revalidatePath('/admin')
  revalidatePath('/properties') // public listing — instant for admin

  return { success: true, propertyId: property.id, status: propertyStatus }
}

export async function deleteProperty(propertyId: string) {
  const session = await requireAuth()

  const property = await prisma.property.findFirst({
    where: { id: propertyId, ownerId: session.userId },
  })

  if (!property) throw new Error('Property not found')

  await prisma.property.delete({ where: { id: propertyId } })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/properties')

  return { success: true }
}

export async function deleteProperties(propertyIds: string[]) {
  const session = await requireAuth()

  await prisma.property.deleteMany({
    where: { id: { in: propertyIds }, ownerId: session.userId },
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/properties')

  return { success: true }
}

export async function updateProperty(propertyId: string, formData: PropertyFormData) {
  const session = await requireAuth()
  if (session.role !== 'ADMIN') throw new Error('Unauthorized')

  const validated = propertyFormSchema.parse(formData)

  const addressToGeocode = validated.fullAddress || `${validated.area}, Belagavi`
  const coords = await geocodeAddress(addressToGeocode)

  const property = await prisma.property.update({
    where: { id: propertyId },
    data: {
      title: validated.title,
      propertyType: validated.propertyType,
      price: validated.price,
      priceMin: validated.price,
      priceMax: validated.price,
      isPricePerSqFt: validated.isPricePerSqFt || false,
      isNegotiable: validated.isNegotiable || false,
      isFree: validated.isFree || false,
      dimensions: validated.dimensions,
      area: validated.area,
      address: validated.fullAddress,
      landmark: validated.landmark,
      latitude: coords?.latitude,
      longitude: coords?.longitude,
      contactNumber: validated.contactNumber,
      whatsappNumber: validated.whatsappNumber,
      bedrooms: validated.bedrooms,
      bathrooms: validated.bathrooms,
      balconies: validated.balconies,
      parking: validated.parking,
      floor: validated.floor,
      totalFloors: validated.totalFloors,
      propertyAge: validated.propertyAge,
      furnished: validated.furnished,
      description: validated.description || '',
    },
  })

  // Wipe and recreate images
  await prisma.propertyImage.deleteMany({ where: { propertyId } })
  if (validated.images?.length > 0) {
    await prisma.propertyImage.createMany({
      data: validated.images.map((url, index) => ({
        propertyId,
        imageUrl: url,
        sortOrder: index,
      })),
    })
  }

  // Wipe and recreate amenities
  await prisma.propertyAmenity.deleteMany({ where: { propertyId } })
  if (validated.amenities?.length) {
    await prisma.propertyAmenity.createMany({
      data: validated.amenities.map((name) => ({
        propertyId,
        name,
      })),
    })
  }

  await createAuditLog({
    userId: session.userId,
    action: 'PROPERTY_UPDATED',
    metadata: { propertyId, title: validated.title },
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/properties')
  revalidatePath('/admin')
  revalidatePath('/admin/properties')
  revalidatePath('/properties')
  revalidatePath(`/properties/${property.slug}`)

  return { success: true, propertyId }
}
