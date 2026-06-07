'use client'

import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import Link from 'next/link'

interface LockOverlayProps {
  message: string
  subMessage?: string
  ctaText: string
  ctaHref: string
  blur?: boolean
}

export function LockOverlay({
  message,
  subMessage,
  ctaText,
  ctaHref,
  blur = true,
}: LockOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`absolute inset-0 flex flex-col items-center justify-center z-10 ${
        blur ? 'bg-dark/60 backdrop-blur-sm' : 'bg-dark/80'
      }`}
    >
      <div className="text-center px-6">
        <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-gold" />
        </div>
        <h3 className="font-body font-semibold text-white text-lg mb-2">
          {message}
        </h3>
        {subMessage && (
          <p className="font-mono text-sm text-white/70 mb-4">{subMessage}</p>
        )}
        <Link
          href={ctaHref}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-dark font-body font-semibold rounded-lg hover:bg-gold-dark transition-colors duration-200"
        >
          {ctaText}
        </Link>
      </div>
    </motion.div>
  )
}

export default LockOverlay
