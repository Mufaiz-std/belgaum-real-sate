import * as React from 'react'
import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex h-11 w-full rounded-lg border border-neutral/30 bg-white px-4 py-2 font-body text-sm text-dark transition-colors',
        'placeholder:text-neutral/50 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
}

export { Input }
