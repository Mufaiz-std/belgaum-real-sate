import * as React from 'react'
import { cn } from '@/lib/utils'

function Label({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    <label
      data-slot="label"
      className={cn(
        'font-mono text-xs uppercase tracking-wider text-neutral',
        className
      )}
      {...props}
    />
  )
}

export { Label }
