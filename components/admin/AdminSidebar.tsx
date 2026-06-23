'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Building2,
  Star,
  CreditCard,
  Bell,
  Settings,
  LogOut,
  Home,
  PlusCircle,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { maskPhone } from '@/lib/format'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/properties', label: 'Properties', icon: Building2, badge: true },
  { href: '/admin/upload', label: 'Upload Property', icon: PlusCircle },
  { href: '/admin/subscriptions', label: 'Subscriptions', icon: Star },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

interface AdminSidebarProps {
  adminName: string | null
  adminPhone: string
  pendingCount: number
}

function SidebarContent({
  adminName,
  adminPhone,
  pendingCount,
  pathname,
  onNavClick,
}: AdminSidebarProps & { pathname: string; onNavClick?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="border-b border-white/10 p-5">
        <Link href="/admin" className="flex items-center gap-2" onClick={onNavClick}>
          <Home className="size-6 text-gold" />
          <div>
            <div className="font-mono text-xs font-bold text-gold">XCITY REAL ESTATE</div>
            <div className="font-mono text-[10px] text-cream/50">Admin Panel</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)
          const Icon = item.icon
          const showBadge = item.badge && pendingCount > 0

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 font-body text-sm transition-colors',
                isActive
                  ? 'border-l-2 border-gold bg-cream/5 text-gold'
                  : 'text-cream/70 hover:bg-white/5 hover:text-cream'
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {showBadge && (
                <span className="flex size-5 items-center justify-center rounded-full bg-error text-[10px] font-mono font-bold text-white">
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}
            </Link>
          )
        })}

        <Link
          href="/"
          target="_blank"
          onClick={onNavClick}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 font-body text-sm text-cream/70 transition-colors hover:bg-white/5 hover:text-cream"
        >
          <LogOut className="size-4 shrink-0" />
          Back to Site
        </Link>
      </nav>

      {/* Admin info */}
      <div className="border-t border-white/10 p-4">
        <p className="font-body text-sm text-cream/80">{adminName ?? 'Admin'}</p>
        <p className="font-mono text-xs text-cream/50">{maskPhone(adminPhone)}</p>
      </div>
    </div>
  )
}

export function AdminSidebar({ adminName, adminPhone, pendingCount }: AdminSidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      {/* ── Desktop sidebar (hidden on mobile) ── */}
      <aside className="hidden lg:flex h-screen w-[260px] shrink-0 flex-col bg-dark">
        <SidebarContent
          adminName={adminName}
          adminPhone={adminPhone}
          pendingCount={pendingCount}
          pathname={pathname}
        />
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between bg-dark px-4 py-3 border-b border-white/10">
        <Link href="/admin" className="flex items-center gap-2">
          <Home className="size-5 text-gold" />
          <div className="font-mono text-xs font-bold text-gold leading-none">
            XCITY<br />
            <span className="text-cream/50 font-normal">Admin Panel</span>
          </div>
        </Link>
        <button
          id="admin-mobile-menu-btn"
          onClick={() => setMobileOpen(true)}
          className="p-2 text-cream/70 hover:text-cream transition-colors rounded-lg hover:bg-white/10"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>
      </div>

      {/* ── Mobile drawer overlay ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex"
          onClick={() => setMobileOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Drawer panel */}
          <aside
            className="relative w-[280px] h-full bg-dark flex flex-col shadow-2xl animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              id="admin-mobile-close-btn"
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-cream/50 hover:text-cream rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close menu"
            >
              <X className="size-5" />
            </button>

            <SidebarContent
              adminName={adminName}
              adminPhone={adminPhone}
              pendingCount={pendingCount}
              pathname={pathname}
              onNavClick={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}
    </>
  )
}
