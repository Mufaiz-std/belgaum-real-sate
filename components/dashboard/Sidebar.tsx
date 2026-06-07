'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  Star,
  CreditCard,
  Settings,
  LogOut,
  Home,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { maskPhone } from '@/lib/format'
import { DAILY_TOKEN_LIMIT } from '@/lib/constants'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/properties', label: 'My Properties', icon: Building2 },
  { href: '/dashboard/upload', label: 'Upload Property', icon: PlusCircle },
  { href: '/dashboard/subscription', label: 'Subscription', icon: Star },
  { href: '/dashboard/payments', label: 'Payment History', icon: CreditCard },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

interface SidebarProps {
  phone: string
  role: string
  tokensToday: number
  isSubscriber: boolean
}

export function Sidebar({ phone, role, tokensToday, isSubscriber }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/session', { method: 'DELETE' })
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col bg-dark min-h-screen">
      <div className="p-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <Home className="size-6 text-gold" />
          <div className="font-mono text-xs text-white leading-tight">
            <span className="block font-bold text-gold">BELGAUM</span>
            <span className="block">REAL ESTATE</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 font-body text-sm transition-colors',
                isActive
                  ? 'border-l-2 border-gold bg-gold/10 text-gold'
                  : 'text-cream/70 hover:bg-white/5 hover:text-cream'
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-body text-sm text-cream/70 transition-colors hover:bg-white/5 hover:text-cream"
        >
          <LogOut className="size-4 shrink-0" />
          Logout
        </button>
      </nav>

      <div className="m-4 rounded-xl bg-white/5 p-4">
        <p className="font-mono text-xs text-cream/60">{maskPhone(phone)}</p>
        <span className="mt-2 inline-block rounded bg-gold px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-dark">
          {role === 'SUBSCRIBER' ? 'SUBSCRIBER' : 'USER'}
        </span>
        {isSubscriber && (
          <div className="mt-3 flex items-center gap-2">
            <span className="size-2 rounded-full bg-success" />
            <span className="font-mono text-xs text-cream/70">
              {tokensToday} / {DAILY_TOKEN_LIMIT} tokens today
            </span>
          </div>
        )}
      </div>
    </aside>
  )
}
