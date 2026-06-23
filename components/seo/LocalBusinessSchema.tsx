export function LocalBusinessSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'XcityRealEstate.in',
    description:
      'Zero brokerage real estate marketplace for Belagavi, Karnataka. Connect directly with property owners.',
    url: 'https://xcityrealestate.in',
    email: 'info@xcityrealestate.in',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Belagavi',
      addressLocality: 'Belagavi',
      addressRegion: 'Karnataka',
      postalCode: '590001',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 15.8497,
      longitude: 74.4977,
    },
    openingHours: 'Mo-Su 00:00-24:00',
    priceRange: '₹₹',
    sameAs: [],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
