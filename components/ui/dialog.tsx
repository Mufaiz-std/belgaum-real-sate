'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DialogContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextValue | null>(null)

function Dialog({
  children,
  open: controlledOpen,
  onOpenChange,
}: {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  )
}

function useDialog() {
  const ctx = React.useContext(DialogContext)
  if (!ctx) throw new Error('useDialog must be used within Dialog')
  return ctx
}

function DialogTrigger({
  children,
  asChild,
}: {
  children: React.ReactNode
  asChild?: boolean
}) {
  const ctx = React.useContext(DialogContext)
  if (!ctx) return null

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
      onClick: () => ctx.setOpen(true),
    })
  }

  return (
    <button type="button" onClick={() => ctx.setOpen(true)}>
      {children}
    </button>
  )
}

function DialogContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const ctx = React.useContext(DialogContext)
  if (!ctx?.open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-dark/50 backdrop-blur-sm"
        onClick={() => ctx.setOpen(false)}
      />
      <div
        className={cn(
          'relative z-50 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl',
          className
        )}
      >
        <button
          type="button"
          onClick={() => ctx.setOpen(false)}
          className="absolute right-4 top-4 rounded-lg p-1 text-neutral hover:text-dark"
        >
          <X className="size-4" />
        </button>
        {children}
      </div>
    </div>
  )
}

function DialogHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mb-4 pr-8', className)}>{children}</div>
}

function DialogTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn('font-headline text-xl text-dark', className)}>{children}</h2>
  )
}

function DialogDescription({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <p className={cn('mt-2 text-sm text-neutral font-body', className)}>{children}</p>
}

function DialogFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mt-6 flex justify-end gap-3', className)}>{children}</div>
}

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  useDialog,
}
