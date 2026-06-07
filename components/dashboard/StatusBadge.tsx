import { cn } from '@/lib/utils'

const statusStyles: Record<string, string> = {
  ACTIVE: 'bg-success/10 text-success',
  PENDING: 'bg-warning/10 text-warning',
  SOLD: 'bg-neutral/10 text-neutral',
  REJECTED: 'bg-error/10 text-error',
  SUCCESS: 'bg-success/10 text-success',
  FAILED: 'bg-error/10 text-error',
  EXPIRED: 'bg-neutral/10 text-neutral',
  CANCELLED: 'bg-neutral/10 text-neutral',
  REFUNDED: 'bg-warning/10 text-warning',
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 font-mono text-xs font-medium uppercase',
        statusStyles[status] ?? 'bg-neutral/10 text-neutral'
      )}
    >
      {status}
    </span>
  )
}
