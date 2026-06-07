import type { Metadata } from 'next'
import { PublicPageShell } from '@/components/layout/PublicPageShell'

export const metadata: Metadata = {
  title: 'Refund Policy',
}

export default function RefundPage() {
  return (
    <PublicPageShell title="Refund Policy" subtitle="Last updated: June 2025">
      <div className="space-y-6 font-body text-sm leading-relaxed text-neutral">
        <section>
          <h2 className="font-headline text-lg font-semibold text-dark">Subscription Plans</h2>
          <p>
            Refund requests for Basic, Premium, or Gold subscriptions may be considered within
            7 days of purchase if you have not used any daily property views. Partial refunds
            are not available after views have been consumed.
          </p>
        </section>
        <section>
          <h2 className="font-headline text-lg font-semibold text-dark">Single Property Unlock</h2>
          <p>
            Single-property unlock fees (₹500) are non-refundable once the property contact
            has been accessed, unless the listing was removed due to our error or fraud.
          </p>
        </section>
        <section>
          <h2 className="font-headline text-lg font-semibold text-dark">How to Request</h2>
          <p>
            Email hello@belgaumrealestate.in with your registered phone number, order ID, and
            reason for the refund. We respond within 3–5 business days. Approved refunds are
            processed to the original payment method within 7–10 business days.
          </p>
        </section>
        <section>
          <h2 className="font-headline text-lg font-semibold text-dark">Failed Payments</h2>
          <p>
            If payment was deducted but access was not granted, contact us immediately with
            your Cashfree transaction ID. We will verify with the payment gateway and resolve
            within 48 hours.
          </p>
        </section>
      </div>
    </PublicPageShell>
  )
}
