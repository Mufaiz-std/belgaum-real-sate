import { LRUCache } from 'lru-cache'

type Options = {
  uniqueTokenPerInterval?: number
  interval?: number
  limit: number
}

export function rateLimit(options: Options) {
  const tokenCache = new LRUCache<string, number[]>({
    max: options.uniqueTokenPerInterval ?? 500,
    ttl: options.interval ?? 60000,
  })

  return {
    check: (identifier: string) => {
      const tokenCount = tokenCache.get(identifier) ?? []
      const now = Date.now()
      const windowStart = now - (options.interval ?? 60000)
      const requestsInWindow = tokenCount.filter((t) => t > windowStart)

      if (requestsInWindow.length >= options.limit) {
        throw new Error('RATE_LIMIT_EXCEEDED')
      }

      tokenCache.set(identifier, [...requestsInWindow, now])
    },
  }
}

export const otpLimiter = rateLimit({ limit: 5, interval: 3600000 })
export const apiLimiter = rateLimit({ limit: 60, interval: 60000 })
export const uploadLimiter = rateLimit({ limit: 10, interval: 3600000 })
