import type { Property, PropertyImage } from '@prisma/client'

interface PropertyWithImages extends Property {
  images: PropertyImage[]
}

export function PropertyListingSchema({
  property,
}: {
  property: PropertyWithImages
}) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? 'https://xcityrealestate.in'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description,
    url: `${baseUrl}/properties/${property.slug}`,
    image: property.images.map((i) => i.imageUrl),
    offers: {
      '@type': 'Offer',
      price: property.priceMin,
      priceCurrency: 'INR',
      priceSpecification: {
        '@type': 'PriceSpecification',
        minPrice: property.priceMin,
        maxPrice: property.priceMax,
        priceCurrency: 'INR',
      },
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.area,
      addressRegion: 'Karnataka',
      addressCountry: 'IN',
      postalCode: '590001',
    },
    ...(property.bedrooms && { numberOfRooms: property.bedrooms }),
    ...(property.areaSqft && {
      floorSize: {
        '@type': 'QuantitativeValue',
        value: property.areaSqft,
        unitCode: 'FTK',
      },
    }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
