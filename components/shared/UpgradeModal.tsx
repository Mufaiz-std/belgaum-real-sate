'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import Link from 'next/link'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  trigger?: 'tokens' | 'access'
  propertyId?: string
}

export function UpgradeModal({
  isOpen,
  onClose,
  trigger = 'access',
  propertyId,
}: UpgradeModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-dark/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-8 shadow-2xl"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 text-neutral hover:text-dark"
            >
              <X className="size-5" />
            </button>

            <h2 className="mb-2 font-headline text-2xl text-dark">
              {trigger === 'tokens' ? 'Daily Limit Reached' : 'Unlock Full Access'}
            </h2>
            <p className="mb-6 font-body text-sm text-neutral">
              {trigger === 'tokens'
                ? 'You have used all 15 contacts for today. Upgrade to continue or come back tomorrow.'
                : 'Purchase access to view owner contact, exact location, and full photo gallery.'}
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-cream-dark p-4">
                <div className="mb-1 font-mono text-xs text-neutral">ONE PROPERTY</div>
                <div className="font-mono text-2xl font-bold text-gold">₹500</div>
                <div className="mt-1 font-body text-xs text-neutral">
                  Lifetime access to 1 listing
                </div>
                <Link
                  href={
                    propertyId
                      ? `/payment/checkout?type=single&propertyId=${propertyId}`
                      : '/properties'
                  }
                  onClick={onClose}
                  className="mt-3 block rounded-lg bg-cream py-2 text-center font-body text-sm text-dark transition-colors hover:bg-cream-dark"
                >
                  {propertyId ? 'Unlock Now' : 'Browse & Unlock'}
                </Link>
              </div>

              <div className="rounded-xl border border-gold bg-dark p-4">
                <div className="mb-1 font-mono text-xs text-gold">UNLIMITED</div>
                <div className="font-mono text-2xl font-bold text-gold">₹3,000</div>
                <div className="mt-1 font-body text-xs text-cream/60">3 months · 15/day</div>
                <Link
                  href="/pricing"
                  onClick={onClose}
                  className="mt-3 block rounded-lg bg-gold py-2 text-center font-body text-sm text-dark transition-colors hover:bg-gold-light"
                >
                  View Plans
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default UpgradeModal
