import * as React from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

function Select({ className, children, ...props }: React.ComponentProps<'select'>) {
  return (
    <div className="relative">
      <select
        data-slot="select"
        className={cn(
          'flex h-11 w-full appearance-none rounded-lg border border-neutral/30 bg-white px-4 py-2 pr-10 font-body text-sm text-dark transition-colors',
          'focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-neutral" />
    </div>
  )
}

export { Select }
