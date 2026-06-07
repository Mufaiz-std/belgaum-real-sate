'use client'

import { Zap } from 'lucide-react'

interface TokenCounterProps {
  remaining: number
  total: number
}

export function TokenCounter({ remaining, total }: TokenCounterProps) {
  const percentage = total > 0 ? (remaining / total) * 100 : 0
  const isLow = remaining <= 3

  return (
    <div className="flex items-center gap-2 rounded-lg bg-cream px-3 py-2">
      <Zap className={`size-4 ${isLow ? 'text-error' : 'text-gold'}`} />
      <div>
        <div className="font-mono text-xs text-neutral">TODAY&apos;S ACCESS</div>
        <div
          className={`font-mono text-sm font-bold ${isLow ? 'text-error' : 'text-dark'}`}
        >
          {remaining} / {total} remaining
        </div>
      </div>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-cream-dark">
        <div
          className={`h-full rounded-full transition-all ${isLow ? 'bg-error' : 'bg-gold'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
