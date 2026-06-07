import type { Metadata } from 'next'
import { getPropertyBySlug } from '@/services/propertyService'
import { PropertyListingSchema } from '@/components/seo/PropertyListingSchema'

export const dynamic = 'force-dynamic'

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? 'https://belgaumrealestate.in'

  try {
    const property = await getPropertyBySlug(slug)
    if (!property || property.status !== 'ACTIVE') {
      return { title: 'Property Not Found' }
    }

    const coverImage = property.images[0]?.imageUrl
    const priceMinL = (property.priceMin / 100000).toFixed(0)
    const priceMaxL = (property.priceMax / 100000).toFixed(0)

    return {
      title: `${property.title} | ${property.area}, Belagavi`,
      description: `${property.propertyType} in ${property.area}, Belagavi. Price: ₹${priceMinL}L – ₹${priceMaxL}L. ${property.bedrooms ? `${property.bedrooms} BHK.` : ''} ${property.areaSqft ? `${property.areaSqft} sqft.` : ''} Direct owner contact. Zero brokerage.`,
      openGraph: {
        title: property.title,
        description: `${property.propertyType} in ${property.area}, Belagavi`,
        images: coverImage
          ? [{ url: coverImage, width: 800, height: 600, alt: property.title }]
          : [],
      },
      alternates: {
        canonical: `${baseUrl}/properties/${property.slug}`,
      },
    }
  } catch {
    return { title: 'Property | BelgaumRealEstate.in' }
  }
}

export default async function PropertyLayout({
  children,
  params,
}: LayoutProps) {
  const { slug } = await params
  let schema = null

  try {
    const property = await getPropertyBySlug(slug)
    if (property && property.status === 'ACTIVE') {
      schema = <PropertyListingSchema property={property} />
    }
  } catch {
    // DB unavailable
  }

  return (
    <>
      {schema}
      {children}
    </>
  )
}
