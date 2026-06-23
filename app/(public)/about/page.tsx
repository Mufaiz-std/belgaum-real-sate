import type { Metadata } from 'next'
import { PublicPageShell } from '@/components/layout/PublicPageShell'
import { Shield, Users, MapPin, Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'XcityRealEstate.in is Belagavi\'s zero-brokerage property marketplace. Connect directly with verified property owners.',
}

const values = [
  {
    icon: Shield,
    title: 'Verified Listings',
    text: 'Every property is reviewed by our team before going live.',
  },
  {
    icon: Users,
    title: 'Direct Owner Contact',
    text: 'No brokers, no middlemen — talk to owners directly.',
  },
  {
    icon: MapPin,
    title: 'Belagavi Focused',
    text: 'Listings across 48+ areas — Tilakwadi, Shahapur, Camp Area & more.',
  },
  {
    icon: Zap,
    title: 'Zero Brokerage',
    text: 'Transparent pricing with subscription plans or single-property unlock.',
  },
]

export default function AboutPage() {
  return (
    <PublicPageShell
      title="About XcityRealEstate.in"
      subtitle="Belagavi's trusted zero-brokerage property marketplace"
    >
      <div className="space-y-8 font-body text-neutral leading-relaxed">
        <p>
          XcityRealEstate.in was built for buyers and sellers in Belagavi who are tired of
          brokerage fees and unreliable listings. We connect you directly with property owners
          — whether you are looking for a flat in Tilakwadi, a plot in Shahapur, or commercial
          space near Camp Area.
        </p>
        <p>
          Our platform lists houses, apartments, villas, plots, commercial properties, and
          agricultural land across the city. Subscribers get daily access to owner contact
          details and full property galleries. Owners can list their properties for free
          review and approval.
        </p>

        <div className="grid gap-6 sm:grid-cols-2">
          {values.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-cream-dark p-5"
            >
              <item.icon className="mb-3 size-8 text-gold" />
              <h3 className="font-headline text-lg font-semibold text-dark">{item.title}</h3>
              <p className="mt-2 text-sm">{item.text}</p>
            </div>
          ))}
        </div>

        <p className="text-sm">
          Based in Tilakwadi, Belagavi, Karnataka. Questions?{' '}
          <a href="/contact" className="text-gold hover:underline">
            Contact us
          </a>
          .
        </p>
      </div>
    </PublicPageShell>
  )
}
