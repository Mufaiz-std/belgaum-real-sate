import type { Metadata } from 'next'
import { PublicPageShell } from '@/components/layout/PublicPageShell'

export const metadata: Metadata = {
  title: 'Terms of Service',
}

export default function TermsPage() {
  return (
    <PublicPageShell title="Terms of Service" subtitle="Last updated: June 2025">
      <div className="space-y-6 font-body text-sm leading-relaxed text-neutral">
        <section>
          <h2 className="font-headline text-lg font-semibold text-dark">1. Acceptance</h2>
          <p>
            By using BelgaumRealEstate.in you agree to these terms. If you do not agree,
            please do not use the platform.
          </p>
        </section>
        <section>
          <h2 className="font-headline text-lg font-semibold text-dark">2. Platform Role</h2>
          <p>
            We are a listing marketplace, not a real estate broker. We do not guarantee
            property titles, legal clearance, or transaction outcomes. Buyers and sellers
            must conduct their own due diligence.
          </p>
        </section>
        <section>
          <h2 className="font-headline text-lg font-semibold text-dark">3. Subscriptions & Payments</h2>
          <p>
            Subscription plans grant access to owner contacts and property details for the
            plan duration. Daily view limits apply. Single-property unlocks are non-transferable.
            All prices include applicable GST.
          </p>
        </section>
        <section>
          <h2 className="font-headline text-lg font-semibold text-dark">4. Listings</h2>
          <p>
            Property owners are responsible for accurate listing information. We reserve the
            right to reject, remove, or modify listings that violate our guidelines or contain
            misleading information.
          </p>
        </section>
        <section>
          <h2 className="font-headline text-lg font-semibold text-dark">5. Prohibited Use</h2>
          <p>
            Scraping, reselling contact data, spamming owners, or circumventing access controls
            is prohibited and may result in account suspension.
          </p>
        </section>
        <section>
          <h2 className="font-headline text-lg font-semibold text-dark">6. Liability</h2>
          <p>
            BelgaumRealEstate.in is provided &quot;as is&quot;. We are not liable for disputes
            between buyers and sellers or for losses arising from property transactions.
          </p>
        </section>
      </div>
    </PublicPageShell>
  )
}
