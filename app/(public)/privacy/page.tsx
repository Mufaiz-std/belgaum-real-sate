import type { Metadata } from 'next'
import { PublicPageShell } from '@/components/layout/PublicPageShell'

export const metadata: Metadata = {
  title: 'Privacy Policy',
}

export default function PrivacyPage() {
  return (
    <PublicPageShell title="Privacy Policy" subtitle="Last updated: June 2025">
      <div className="prose prose-neutral max-w-none space-y-6 font-body text-sm leading-relaxed text-neutral">
        <section>
          <h2 className="font-headline text-lg font-semibold text-dark">Information We Collect</h2>
          <p>
            We collect your phone number (for OTP login), name, email (optional), property
            listing details, and payment transaction records. Firebase Authentication handles
            phone verification. Payment data is processed by Cashfree — we do not store card
            or UPI credentials.
          </p>
        </section>
        <section>
          <h2 className="font-headline text-lg font-semibold text-dark">How We Use Your Data</h2>
          <p>
            Your data is used to provide platform access, process payments, send transaction
            and listing notifications, and improve our services. Owner contact details are
            shared only with subscribed or unlocked users.
          </p>
        </section>
        <section>
          <h2 className="font-headline text-lg font-semibold text-dark">Data Sharing</h2>
          <p>
            We do not sell your personal data. We share data with service providers (Firebase,
            Cashfree, Cloudinary, email/SMS providers) only as needed to operate the platform.
          </p>
        </section>
        <section>
          <h2 className="font-headline text-lg font-semibold text-dark">Your Rights</h2>
          <p>
            You may update your profile in Dashboard → Settings or request account deletion.
            Contact hello@belgaumrealestate.in for data requests.
          </p>
        </section>
        <section>
          <h2 className="font-headline text-lg font-semibold text-dark">Contact</h2>
          <p>
            Questions about privacy: hello@belgaumrealestate.in, Tilakwadi, Belagavi 590006.
          </p>
        </section>
      </div>
    </PublicPageShell>
  )
}
