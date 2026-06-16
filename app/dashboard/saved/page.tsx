import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { PropertyCard } from '@/components/properties/PropertyCard'
import { Bookmark } from 'lucide-react'

export const metadata = {
  title: 'Saved Properties | Dashboard',
  description: 'View your saved properties',
}

export default async function SavedPropertiesPage() {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }

  const savedPropertiesRecords = await prisma.savedProperty.findMany({
    where: { userId: session.userId },
    include: {
      property: {
        include: { images: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const properties = savedPropertiesRecords.map((record: any) => {
    const p = record.property
    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      area: p.area,
      priceMin: p.priceMin,
      priceMax: p.priceMax,
      beds: p.bedrooms || 0,
      baths: p.bathrooms || 0,
      sqft: p.areaSqft || 0,
      type: p.propertyType,
      badge: p.status === 'SOLD' ? 'SOLD' : (p.isFeatured ? 'FEATURED' : undefined),
      image: p.images[0]?.imageUrl || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    }
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-dark">Saved Properties</h1>
        <p className="font-body text-neutral mt-2">
          Properties you have bookmarked for later.
        </p>
      </div>

      {properties.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((prop: any, index: number) => (
            <PropertyCard
              key={prop.id}
              property={prop as any}
              index={index}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-cream-dark">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cream mb-4 text-gold">
            <Bookmark className="w-8 h-8" />
          </div>
          <h2 className="font-display text-xl text-dark mb-2">No saved properties yet</h2>
          <p className="font-body text-neutral max-w-md mx-auto">
            You haven't bookmarked any properties. Browse our listings and save the ones you like!
          </p>
        </div>
      )}
    </div>
  )
}
