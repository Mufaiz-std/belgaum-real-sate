import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { getDashboardUser } from '@/lib/dashboard'
import { redirect, notFound } from 'next/navigation'
import { UploadPropertyForm } from '@/components/dashboard/upload/UploadPropertyForm'
import { PropertyFormData } from '@/lib/upload-schemas'

export default async function AdminEditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const session = await getSession()
  if (!session) redirect('/login')

  const user = await getDashboardUser(session.userId)
  if (!user || user.role !== 'ADMIN') redirect('/login')

  const property = await prisma.property.findUnique({
    where: { id: resolvedParams.id },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      amenities: true,
    },
  })

  if (!property) return notFound()

  // Map to PropertyFormData
  const initialData: PropertyFormData = {
    title: property.title,
    propertyType: property.propertyType,
    transactionType: 'SALE',
    price: property.price,
    area: property.area,
    fullAddress: property.address || '',
    contactNumber: property.contactNumber || '',
    whatsappNumber: property.whatsappNumber || '',
    bedrooms: property.bedrooms || undefined,
    bathrooms: property.bathrooms || undefined,
    balconies: property.balconies || undefined,
    parking: property.parking || undefined,
    floor: property.floor || undefined,
    totalFloors: property.totalFloors || undefined,
    propertyAge: (property.propertyAge as any) || undefined,
    furnished: (property.furnished as any) || undefined,
    description: property.description,
    amenities: property.amenities.map(a => a.name),
    images: property.images.map(img => img.imageUrl),
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-2xl text-dark">Edit Property</h1>
        <p className="mt-1 font-body text-neutral">
          Modify the details for {property.title}
        </p>
      </div>

      <UploadPropertyForm
        isAdmin={true}
        isEditMode={true}
        initialData={initialData}
        propertyId={property.id}
      />
    </div>
  )
}
