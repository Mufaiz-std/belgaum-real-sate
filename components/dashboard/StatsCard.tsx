import Link from 'next/link'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  borderColor: string
  iconColor: string
  action?: { label: string; href: string }
}

export function StatsCard({
  label,
  value,
  icon: Icon,
  borderColor,
  iconColor,
  action,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-xl border-l-4 bg-white p-5 shadow-sm',
        borderColor
      )}
    >
      <Icon className={cn('absolute right-4 top-4 size-5', iconColor)} />
      <p className="font-mono text-3xl font-bold text-dark">{value}</p>
      <p className="mt-1 font-body text-sm text-neutral">{label}</p>
      {action && (
        <Link href={action.href} className="mt-2 inline-block text-sm font-medium text-gold hover:underline">
          {action.label}
        </Link>
      )}
    </div>
  )
}
