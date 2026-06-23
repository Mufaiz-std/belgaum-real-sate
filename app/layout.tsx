import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Fira_Sans, Space_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
})

const fira = Fira_Sans({
  variable: '--font-fira',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
})

const spaceMono = Space_Mono({
  variable: '--font-space-mono',
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://xcityrealestate.in'),
  title: {
    default:
      'Xcity RealEstate | Buy & Sell Property in Belagavi | Zero Brokerage',
    template: '%s | XcityRealEstate.in',
  },
  description:
    'Find flats, plots, houses, villas and commercial properties in Belagavi with direct owner contact. Zero brokerage. Browse verified listings in Tilakwadi, Shahapur, Camp Area and more.',
  keywords: [
    'Xcity RealEstate',
    'Belagavi Property',
    'Plots in Belgaum',
    'House for Sale Belgaum',
    'Flats in Belagavi',
    'Commercial Property Belgaum',
    'Zero Brokerage Belagavi',
    'Property in Tilakwadi',
    'Direct Owner Contact',
  ],
  authors: [{ name: 'XcityRealEstate.in' }],
  creator: 'XcityRealEstate.in',
  publisher: 'XcityRealEstate.in',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://xcityrealestate.in',
    siteName: 'XcityRealEstate.in',
    title: 'Xcity RealEstate | Buy & Sell Property in Belagavi',
    description:
      'Find flats, plots, houses and commercial properties in Belagavi with direct owner contact. Zero brokerage.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'XcityRealEstate.in — Zero Brokerage Property Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Xcity RealEstate | Zero Brokerage',
    description:
      'Find verified properties in Belagavi with direct owner contact.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },
  alternates: {
    canonical: 'https://xcityrealestate.in',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#D4A017',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${fira.variable} ${spaceMono.variable} bg-cream`}
    >
      <body className="font-body antialiased text-dark">
        {children}
        <Toaster position="top-center" richColors />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
