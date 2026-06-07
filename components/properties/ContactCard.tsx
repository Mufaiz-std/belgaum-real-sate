'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { KeyRound, Crown, Phone, MessageCircle, Send } from 'lucide-react'
import Link from 'next/link'
import { AccessLevel } from '@/lib/types'

interface ContactCardProps {
  accessLevel: AccessLevel
  ownerName?: string | null
  ownerPhone?: string | null
  ownerWhatsapp?: string | null
  propertyId: string
  onUnlockClick: () => void
  tokensRemaining?: number
}

export function ContactCard({
  accessLevel,
  ownerName,
  ownerPhone,
  ownerWhatsapp,
  propertyId,
  onUnlockClick,
  tokensRemaining = 14,
}: ContactCardProps) {
  const [inquiry, setInquiry] = useState('')
  const [sending, setSending] = useState(false)

  const isLocked = accessLevel === 'GUEST' || accessLevel === 'REGISTERED'

  const handleSendInquiry = async () => {
    if (!inquiry.trim()) return
    setSending(true)
    // TODO: POST /api/inquiries with propertyId and message
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setInquiry('')
    setSending(false)
    alert('Inquiry sent successfully!')
  }

  const handleCallOwner = () => {
    // TODO: POST /api/tokens/consume then open tel: link
    if (ownerPhone) {
      window.open(`tel:${ownerPhone}`, '_self')
    }
  }

  const handleWhatsApp = () => {
    // TODO: POST /api/tokens/consume then open WhatsApp link
    if (ownerWhatsapp) {
      const message = encodeURIComponent(
        `Hi, I'm interested in your property listed on BelgaumRealEstate.in`
      )
      window.open(`https://wa.me/${ownerWhatsapp}?text=${message}`, '_blank')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-xl shadow-lg border border-cream-dark p-6 sticky top-28"
    >
      {isLocked ? (
        <>
          {/* Blurred Owner Section */}
          <div className="mb-6 select-none" style={{ filter: 'blur(6px)' }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-neutral/30" />
              <div>
                <div className="h-4 w-32 bg-neutral/30 rounded mb-2" />
                <div className="h-3 w-24 bg-neutral/20 rounded" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-10 w-full bg-neutral/20 rounded-lg" />
              <div className="h-10 w-full bg-neutral/20 rounded-lg" />
            </div>
          </div>

          {/* Unlock Content */}
          <div className="text-center">
            <h3 className="font-body font-semibold text-dark text-lg mb-2">
              Unlock to Contact Owner
            </h3>
            <p className="font-body text-sm text-neutral mb-6">
              Get direct owner contact, WhatsApp, and exact address
            </p>

            {/* Option Buttons */}
            <div className="space-y-3">
              <button
                onClick={onUnlockClick}
                className="w-full flex items-center justify-center gap-3 px-5 py-4 bg-gold text-dark font-body font-semibold rounded-xl hover:bg-gold-dark transition-colors"
              >
                <KeyRound className="w-5 h-5" />
                <div className="text-left">
                  <span className="block">Unlock This Property — ₹500</span>
                  <span className="text-xs font-normal opacity-80">
                    One-time lifetime access
                  </span>
                </div>
              </button>

              <Link
                href="/pricing"
                className="w-full flex items-center justify-center gap-3 px-5 py-4 bg-dark text-white font-body font-semibold rounded-xl hover:bg-dark/90 transition-colors"
              >
                <Crown className="w-5 h-5 text-gold" />
                <div className="text-left">
                  <span className="block">Get Unlimited Access</span>
                  <span className="text-xs font-normal opacity-80">
                    From ₹3,000 for 3 months
                  </span>
                </div>
              </Link>
            </div>

            {/* Terms */}
            <p className="font-mono text-[10px] text-neutral mt-4">
              By unlocking, you agree to our{' '}
              <Link href="/terms" className="text-gold hover:underline">
                Terms
              </Link>
            </p>
          </div>
        </>
      ) : (
        <>
          {/* Owner Info */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-gold/20 flex items-center justify-center">
              <span className="font-display text-xl text-gold">
                {ownerName?.charAt(0) || 'O'}
              </span>
            </div>
            <div>
              <h3 className="font-body font-semibold text-dark">
                {ownerName || 'Property Owner'}
              </h3>
              <p className="font-mono text-sm text-neutral">Property Owner</p>
            </div>
          </div>

          {/* Contact Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={handleCallOwner}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-success text-white font-body font-medium rounded-lg hover:bg-success/90 transition-colors"
            >
              <Phone className="w-5 h-5" />
              Call Owner
            </button>
            <button
              onClick={handleWhatsApp}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] text-white font-body font-medium rounded-lg hover:bg-[#22c55e] transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp
            </button>
          </div>

          {/* Inquiry Form */}
          <div className="border-t border-cream-dark pt-6">
            <h4 className="font-body font-semibold text-dark mb-3">
              Send Inquiry
            </h4>
            <textarea
              value={inquiry}
              onChange={(e) => setInquiry(e.target.value)}
              placeholder="Write your message to the owner..."
              rows={4}
              className="w-full px-4 py-3 bg-cream/50 border border-cream-dark rounded-lg font-body text-sm text-dark placeholder:text-neutral focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none"
            />
            <button
              onClick={handleSendInquiry}
              disabled={!inquiry.trim() || sending}
              className="w-full flex items-center justify-center gap-2 mt-3 px-4 py-3 bg-dark text-white font-body font-medium rounded-lg hover:bg-dark/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
              {sending ? 'Sending...' : 'Send Inquiry'}
            </button>
          </div>

          {/* Token Counter for Subscribers */}
          {accessLevel === 'SUBSCRIBER' && (
            <p className="font-mono text-sm text-gold text-center mt-4">
              {tokensRemaining} contacts remaining today
            </p>
          )}
        </>
      )}
    </motion.div>
  )
}

export default ContactCard
