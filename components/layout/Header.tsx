'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Menu, X } from 'lucide-react'

const navLinks = [
  { href: '/properties', label: 'Properties' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-dark/95 backdrop-blur-md border-b border-gold/25'
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Home className="w-8 h-8 text-gold" />
            <div className="font-mono text-gold text-sm leading-tight">
              <span className="block font-bold">BELGAUM</span>
              <span className="block">REAL ESTATE</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-body text-cream/80 hover:text-gold transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="px-5 py-2.5 border border-gold text-gold font-body font-medium rounded-lg hover:bg-gold/10 transition-colors duration-200"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard/upload"
              className="px-5 py-2.5 bg-gold text-dark font-body font-medium rounded-lg hover:bg-gold-light transition-colors duration-200"
            >
              Upload Property
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-cream"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-dark border-t border-gold/25"
          >
            <nav className="flex flex-col px-4 py-6 gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-body text-cream/80 hover:text-gold transition-colors duration-200 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-gold/25">
                <Link
                  href="/login"
                  className="px-5 py-2.5 border border-gold text-gold font-body font-medium rounded-lg text-center hover:bg-gold/10 transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/dashboard/upload"
                  className="px-5 py-2.5 bg-gold text-dark font-body font-medium rounded-lg text-center hover:bg-gold-light transition-colors duration-200"
                >
                  Upload Property
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

export default Header
