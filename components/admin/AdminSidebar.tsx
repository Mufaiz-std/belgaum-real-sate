'use client'

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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { maskPhone } from '@/lib/format'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/properties', label: 'Properties', icon: Building2, badge: true },
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

export function AdminSidebar({ adminName, adminPhone, pendingCount }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-[260px] shrink-0 flex-col bg-dark">
      <div className="border-b border-white/10 p-6">
        <Link href="/admin" className="flex items-center gap-2">
          <Home className="size-6 text-gold" />
          <div>
            <div className="font-mono text-xs font-bold text-gold">BELGAUM REAL ESTATE</div>
            <div className="font-mono text-[10px] text-cream/50">Admin Panel</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
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
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 font-body text-sm text-cream/70 transition-colors hover:bg-white/5 hover:text-cream"
        >
          <LogOut className="size-4 shrink-0" />
          Back to Site
        </Link>
      </nav>

      <div className="border-t border-white/10 p-4">
        <p className="font-body text-sm text-cream/80">{adminName ?? 'Admin'}</p>
        <p className="font-mono text-xs text-cream/50">{maskPhone(adminPhone)}</p>
      </div>
    </aside>
  )
}
