'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Menu, X, LayoutDashboard, LogOut, ChevronDown, User } from 'lucide-react'

const navLinks = [
  { href: '/properties', label: 'Properties' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

interface SessionUser {
  userId: string
  role: string
}

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loadingSession, setLoadingSession] = useState(true)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Lightweight session check — JWT only, no DB hit, instant
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.userId) setUser(data.user)
      })
      .catch(() => {})
      .finally(() => setLoadingSession(false))
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/session', { method: 'DELETE' })
    setUser(null)
    setProfileOpen(false)
    router.push('/')
    router.refresh()
  }

  // Simple avatar initial from role
  const getInitial = () => {
    if (user?.role) return user.role.charAt(0).toUpperCase()
    return 'U'
  }

  const displayName = user?.role === 'ADMIN' ? 'Admin' : 'My Account'

  // Nav links shown when logged in — add Dashboard
  const loggedInNavLinks = [
    ...navLinks.slice(0, 2),
    { href: '/dashboard', label: 'Dashboard' },
    ...navLinks.slice(2),
  ]

  const activeNavLinks = user ? loggedInNavLinks : navLinks

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-dark/95 backdrop-blur-md border-b border-gold/25'
          : 'bg-white shadow-[0_4px_24px_0_rgba(0,0,0,0.18)]'
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
              <span className="block font-bold">XCITY</span>
              <span className="block">REAL ESTATE</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {activeNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-body hover:text-gold transition-colors duration-200 ${
                  isScrolled ? 'text-cream/80' : 'text-dark/80'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {!loadingSession && (
              <>
                {user ? (
                  /* Profile Avatar Dropdown */
                  <div ref={profileRef} className="relative">
                    <button
                      id="profile-menu-btn"
                      onClick={() => setProfileOpen((v) => !v)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gold/30 hover:border-gold/60 hover:bg-gold/10 transition-all duration-200 group"
                      aria-label="Profile menu"
                    >
                      {/* Avatar circle */}
                      <span className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-dark font-bold text-sm select-none">
                        {getInitial()}
                      </span>
                      <span className={`font-body text-sm max-w-[120px] truncate group-hover:text-gold transition-colors ${
                        isScrolled ? 'text-cream/80' : 'text-dark/80'
                      }`}>
                        {displayName}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          profileOpen ? 'rotate-180' : ''
                        } ${isScrolled ? 'text-cream/50' : 'text-dark/40'}`}
                      />
                    </button>

                    <AnimatePresence>
                      {profileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.97 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-52 bg-dark border border-gold/25 rounded-xl shadow-2xl overflow-hidden"
                        >
                          {/* User info header */}
                          <div className="px-4 py-3 border-b border-gold/15">
                            <p className="text-cream font-body font-medium text-sm truncate">{displayName}</p>
                            <p className="text-cream/40 font-body text-xs mt-0.5 truncate capitalize">{user?.role?.toLowerCase()} account</p>
                          </div>

                          {/* Menu items */}
                          <div className="py-1">
                            <Link
                              href="/dashboard"
                              id="dropdown-dashboard-link"
                              className="flex items-center gap-3 px-4 py-2.5 text-cream/80 hover:text-gold hover:bg-gold/10 transition-colors duration-150 font-body text-sm"
                              onClick={() => setProfileOpen(false)}
                            >
                              <LayoutDashboard className="w-4 h-4" />
                              Dashboard
                            </Link>
                            <Link
                              href="/dashboard/upload"
                              id="dropdown-upload-link"
                              className="flex items-center gap-3 px-4 py-2.5 text-cream/80 hover:text-gold hover:bg-gold/10 transition-colors duration-150 font-body text-sm"
                              onClick={() => setProfileOpen(false)}
                            >
                              <User className="w-4 h-4" />
                              Upload Property
                            </Link>
                          </div>

                          {/* Logout */}
                          <div className="border-t border-gold/15 py-1">
                            <button
                              id="logout-btn"
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors duration-150 font-body text-sm"
                            >
                              <LogOut className="w-4 h-4" />
                              Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  /* Guest buttons */
                  <>
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
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden p-2 transition-colors duration-200 ${
              isScrolled ? 'text-cream' : 'text-dark'
            }`}
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
              {activeNavLinks.map((link) => (
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
                {!loadingSession && (
                  <>
                    {user ? (
                      <>
                        {/* Mobile user info */}
                        <div className="flex items-center gap-3 px-1 pb-2">
                          <span className="w-9 h-9 rounded-full bg-gold flex items-center justify-center text-dark font-bold text-sm">
                            {getInitial()}
                          </span>
                          <div>
                            <p className="text-cream text-sm font-medium font-body truncate">{displayName}</p>
                            <p className="text-cream/40 text-xs font-body capitalize">{user?.role?.toLowerCase()} account</p>
                          </div>
                        </div>
                        <Link
                          href="/dashboard"
                          className="px-5 py-2.5 bg-gold text-dark font-body font-medium rounded-lg text-center hover:bg-gold-light transition-colors duration-200"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <button
                          onClick={() => { setIsMobileMenuOpen(false); handleLogout() }}
                          className="px-5 py-2.5 border border-red-400/50 text-red-400 font-body font-medium rounded-lg text-center hover:bg-red-500/10 transition-colors duration-200"
                        >
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          className="px-5 py-2.5 border border-gold text-gold font-body font-medium rounded-lg text-center hover:bg-gold/10 transition-colors duration-200"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Sign In
                        </Link>
                        <Link
                          href="/dashboard/upload"
                          className="px-5 py-2.5 bg-gold text-dark font-body font-medium rounded-lg text-center hover:bg-gold-light transition-colors duration-200"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Upload Property
                        </Link>
                      </>
                    )}
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

export default Header
