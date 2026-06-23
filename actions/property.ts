'use server'

import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'
import { geocodeForProperty } from '@/lib/geocoding'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

import { fullPropertySchema, type PropertyFormData } from '@/lib/upload-schemas'

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
  const validated = fullPropertySchema.parse(formData)

  // Admins bypass the approval queue — their properties go live immediately
  const isAdmin = session.role === 'ADMIN'
  const propertyStatus = isAdmin ? 'ACTIVE' : 'PENDING'

  // Geocode: area first (more reliable for Belagavi areas), then full address
  const coords = await geocodeForProperty(validated.area, validated.fullAddress)

  const property = await prisma.property.create({
    data: {
      title: validated.title,
      propertyType: validated.propertyType,
      price: validated.price,
      priceMin: validated.price,
      priceMax: validated.price,
      isPricePerSqFt: validated.isPricePerSqFt || false,
      // isNegotiable: validated.isNegotiable || false,
      // isFree: validated.isFree || false,
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
      instagramLink: validated.instagramLink || null,
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

  const validated = fullPropertySchema.parse(formData)

  // Geocode: area first (more reliable for Belagavi areas), then full address
  const coords = await geocodeForProperty(validated.area, validated.fullAddress)

  const property = await prisma.property.update({
    where: { id: propertyId },
    data: {
      title: validated.title,
      propertyType: validated.propertyType,
      price: validated.price,
      priceMin: validated.price,
      priceMax: validated.price,
      isPricePerSqFt: validated.isPricePerSqFt || false,
      // isNegotiable: validated.isNegotiable || false,
      // isFree: validated.isFree || false,
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
      instagramLink: validated.instagramLink || null,
    },
  })

  // Wipe and recreate images
  await prisma.propertyImage.deleteMany({ where: { propertyId } })
  if (validated.images?.length > 0) {
    await prisma.propertyImage.createMany({
      data: validated.images.map((url: string, index: number) => ({
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
      data: validated.amenities.map((name: string) => ({
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
