import Link from 'next/link'
import { Home, Phone, Mail, MapPin } from 'lucide-react'

const exploreLinks = [
  { href: '/properties', label: 'Properties' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

const propertyTypes = [
  { href: '/properties?type=flat', label: 'Flats' },
  { href: '/properties?type=house', label: 'Houses' },
  { href: '/properties?type=plot', label: 'Plots' },
  { href: '/properties?type=bungalow', label: 'Bungalow' },
  { href: '/properties?type=commercial', label: 'Commercial' },
  { href: '/properties?type=agricultural', label: 'Agricultural' },
]

const legalLinks = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Service' },
  { href: '/refund', label: 'Refund Policy' },
  { href: '/faq', label: 'FAQ' },
]

export function Footer() {
  return (
    <footer className="bg-dark text-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Column 1: Logo & Contact */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <Home className="w-8 h-8 text-gold" />
              <div className="font-mono text-gold text-sm leading-tight">
                <span className="block font-bold">BELGAUM</span>
                <span className="block">REAL ESTATE</span>
              </div>
            </Link>
            <p className="font-body text-cream/70 text-sm">
              Direct from owner. <span className="text-gold">Always.</span>
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 text-cream/70">
                <MapPin className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                <span>Tilakwadi, Belagavi, Karnataka 590006, India</span>
              </div>
              <div className="flex items-center gap-3 text-cream/70">
                <Phone className="w-4 h-4 text-gold shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-3 text-cream/70">
                <Mail className="w-4 h-4 text-gold shrink-0" />
                <span>hello@belgaumrealestate.in</span>
              </div>
            </div>
          </div>

          {/* Column 2: Explore */}
          <div>
            <h3 className="font-headline text-lg font-semibold text-cream mb-6">
              Explore
            </h3>
            <ul className="space-y-3">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body text-cream/70 hover:text-gold transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Property Types */}
          <div>
            <h3 className="font-headline text-lg font-semibold text-cream mb-6">
              Property Types
            </h3>
            <ul className="space-y-3">
              {propertyTypes.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body text-cream/70 hover:text-gold transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h3 className="font-headline text-lg font-semibold text-cream mb-6">
              Legal
            </h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body text-cream/70 hover:text-gold transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gold/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-body text-cream/50 text-sm text-center sm:text-left">
              © 2025 BelgaumRealEstate.in. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="font-body text-cream/50 hover:text-gold transition-colors duration-200 text-sm"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="font-body text-cream/50 hover:text-gold transition-colors duration-200 text-sm"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
