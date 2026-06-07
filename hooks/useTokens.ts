'use client'

import { useState, useCallback } from 'react'
import { apiFetch } from '@/lib/api-client'

export function useTokens(initialRemaining: number) {
  const [remaining, setRemaining] = useState(initialRemaining)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const consumeToken = useCallback(async (): Promise<boolean> => {
    if (remaining <= 0) {
      setShowUpgradeModal(true)
      return false
    }

    try {
      const res = await apiFetch('/api/tokens/consume', { method: 'POST' })
      const data = await res.json()

      if (!res.ok || !data.success) {
        setShowUpgradeModal(true)
        return false
      }

      setRemaining(data.remaining)
      return true
    } catch {
      setShowUpgradeModal(true)
      return false
    }
  }, [remaining])

  return { remaining, consumeToken, showUpgradeModal, setShowUpgradeModal }
}
