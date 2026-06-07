'use client'

import { motion } from 'framer-motion'
import { Search, KeyRound, Phone } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Discover',
    description:
      'Browse verified Belagavi properties with high-res images and accurate price ranges.',
    isHighlighted: false,
  },
  {
    number: '02',
    icon: KeyRound,
    title: 'Unlock',
    description:
      'Pay for lifetime access to one property, or subscribe for unlimited access to all listings.',
    isHighlighted: true,
  },
  {
    number: '03',
    icon: Phone,
    title: 'Connect',
    description:
      'Get owner contact, WhatsApp number, address, gallery, and documents — direct, no middleman.',
    isHighlighted: false,
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

export function HowItWorks() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="font-mono text-gold text-xs uppercase tracking-wider mb-3">
            HOW IT WORKS
          </p>
          <h2 className="font-headline text-3xl sm:text-4xl font-semibold text-dark text-balance">
            Three steps. Zero brokerage.
          </h2>
        </div>

        {/* Steps */}
        <motion.div
          className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {/* Dashed Line Connector (Desktop Only) */}
          <div className="hidden md:block absolute top-1/2 left-[16.67%] right-[16.67%] -translate-y-1/2 h-px border-t-2 border-dashed border-gold/30 -z-0" />

          {steps.map((step, index) => {
            const Icon = step.icon

            return (
              <motion.div
                key={step.number}
                variants={itemVariants}
                className={`relative z-10 flex flex-col items-center text-center p-8 rounded-2xl ${
                  step.isHighlighted
                    ? 'bg-dark text-white shadow-xl'
                    : 'bg-cream'
                }`}
              >
                {/* Step Number */}
                <span
                  className={`font-mono text-4xl font-bold mb-6 ${
                    step.isHighlighted ? 'text-gold' : 'text-gold/50'
                  }`}
                >
                  {step.number}
                </span>

                {/* Icon */}
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${
                    step.isHighlighted
                      ? 'bg-gold/20'
                      : 'bg-gold/10'
                  }`}
                >
                  <Icon
                    className={`w-8 h-8 ${
                      step.isHighlighted ? 'text-gold' : 'text-gold'
                    }`}
                  />
                </div>

                {/* Title */}
                <h3
                  className={`font-headline text-xl font-semibold mb-3 ${
                    step.isHighlighted ? 'text-white' : 'text-dark'
                  }`}
                >
                  {step.title}
                </h3>

                {/* Description */}
                <p
                  className={`font-body text-sm leading-relaxed ${
                    step.isHighlighted ? 'text-cream/70' : 'text-neutral'
                  }`}
                >
                  {step.description}
                </p>

                {/* Connector Dot */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-2 border-gold z-20" />
                )}
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

export default HowItWorks
