'use client'

import { Toaster as Sonner, type ToasterProps } from 'sonner'

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-white group-[.toaster]:text-dark group-[.toaster]:border-border-gold group-[.toaster]:shadow-lg font-body',
          description: 'group-[.toast]:text-neutral',
          actionButton: 'group-[.toast]:bg-gold group-[.toast]:text-dark',
          cancelButton: 'group-[.toast]:bg-cream-dark',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
