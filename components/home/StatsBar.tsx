'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const stats = [
  { value: 8500, suffix: '+', label: 'Happy Listings' },
  { value: 48, suffix: '', label: 'Areas Covered' },
  { value: 0, prefix: '₹', suffix: '', label: 'Brokerage Charged' },
]

function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  inView,
}: {
  value: number
  prefix?: string
  suffix?: string
  inView: boolean
}) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return

    const duration = 2000
    const steps = 60
    const increment = value / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value, inView])

  return (
    <span>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

export function StatsBar() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="bg-dark py-16 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-0 md:divide-x md:divide-gold/25">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="text-center px-8"
            >
              <p className="font-mono text-gold text-5xl sm:text-6xl font-bold mb-3">
                <AnimatedCounter
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  inView={isInView}
                />
              </p>
              <p className="font-body text-cream/60 text-base">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default StatsBar
