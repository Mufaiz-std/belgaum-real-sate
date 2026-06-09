'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, MessageCircle, Send } from 'lucide-react'
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
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setInquiry('')
    setSending(false)
    alert('Inquiry sent successfully!')
  }

  const handleCallOwner = () => {
    if (ownerPhone) window.open(`tel:${ownerPhone}`, '_self')
  }

  const handleWhatsApp = () => {
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
          {/* Header */}
          <h3 className="font-body font-bold text-dark text-xl mb-4">Contact Owner</h3>

          {/* Masked Owner Info */}
          <div className="mb-5">
            <div className="h-5 w-36 bg-neutral/25 rounded mb-2 blur-[3px]" />
            <div className="h-4 w-28 bg-neutral/20 rounded blur-[3px]" />
          </div>

          {/* Single CTA */}
          <button
            onClick={onUnlockClick}
            className="w-full py-4 bg-gold text-dark font-body font-bold text-base rounded-xl hover:bg-gold-dark transition-colors"
          >
            Get Contact
          </button>
        </>
      ) : (
        <>
          {/* Owner Info */}
          <h3 className="font-body font-bold text-dark text-xl mb-4">Contact Owner</h3>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
              <span className="font-display text-lg text-gold">
                {ownerName?.charAt(0) || 'O'}
              </span>
            </div>
            <div>
              <p className="font-body font-semibold text-dark">{ownerName || 'Property Owner'}</p>
              {ownerPhone && (
                <p className="font-mono text-sm text-neutral">
                  {ownerPhone.replace(/(\d{2})(\d{5})(\d{5})/, '+$1-$2XXXXX')}
                </p>
              )}
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
          <div className="border-t border-cream-dark pt-5">
            <h4 className="font-body font-semibold text-dark mb-3">Send Inquiry</h4>
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
