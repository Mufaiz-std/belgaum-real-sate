import type { Metadata } from 'next'
import { PublicPageShell } from '@/components/layout/PublicPageShell'

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about BelgaumRealEstate.in subscriptions, listings, and payments.',
}

const faqs = [
  {
    q: 'Is BelgaumRealEstate.in a brokerage?',
    a: 'No. We are a zero-brokerage marketplace. You connect directly with property owners. We charge a subscription or one-time unlock fee for platform access — not brokerage on transactions.',
  },
  {
    q: 'How do I view owner contact details?',
    a: 'Subscribe to a plan (Basic, Premium, or Gold) or pay ₹500 to unlock a single property. Subscribers get 15 property views per day.',
  },
  {
    q: 'How do I list my property?',
    a: 'Create a free account, go to Dashboard → Upload Property, fill in details and photos. Our team reviews and approves listings within 24–48 hours.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'We accept UPI, cards, net banking, and wallets via Cashfree. GST invoice is generated automatically after payment.',
  },
  {
    q: 'Can I get a refund?',
    a: 'Subscription refunds are handled case-by-case within 7 days if no property views were used. See our Refund Policy for details.',
  },
  {
    q: 'Which areas in Belagavi are covered?',
    a: 'We cover 48+ areas including Tilakwadi, Shahapur, Camp Area, Angol, Vadgaon, and more. New areas are added regularly.',
  },
]

export default function FAQPage() {
  return (
    <PublicPageShell title="Frequently Asked Questions">
      <div className="space-y-6">
        {faqs.map((item) => (
          <div key={item.q} className="border-b border-cream-dark pb-6 last:border-0">
            <h3 className="font-headline text-lg font-semibold text-dark">{item.q}</h3>
            <p className="mt-2 font-body text-sm leading-relaxed text-neutral">{item.a}</p>
          </div>
        ))}
      </div>
    </PublicPageShell>
  )
}
