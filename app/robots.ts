import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? 'https://belgaumrealestate.in'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/dashboard/', '/api/', '/payment/checkout'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
