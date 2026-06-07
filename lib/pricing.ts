export const PLAN_AMOUNTS = {
  BASIC: 3000,
  PREMIUM: 4000,
  GOLD: 6000,
  SINGLE: 500,
} as const

export const PLAN_DETAILS = {
  BASIC: {
    name: 'Basic',
    duration: '3 Months',
    durationDays: 90,
    badge: null as string | null,
    features: {
      contactAccess: true,
      uploadProperties: true,
      dailyViews: true,
      prioritySupport: false,
      featuredListings: false,
    },
  },
  PREMIUM: {
    name: 'Premium',
    duration: '6 Months',
    durationDays: 180,
    badge: 'MOST POPULAR',
    features: {
      contactAccess: true,
      uploadProperties: true,
      dailyViews: true,
      prioritySupport: true,
      featuredListings: false,
    },
  },
  GOLD: {
    name: 'Gold',
    duration: '12 Months',
    durationDays: 365,
    badge: 'BEST VALUE',
    features: {
      contactAccess: true,
      uploadProperties: true,
      dailyViews: true,
      prioritySupport: true,
      featuredListings: true,
    },
  },
} as const

export type PlanKey = keyof typeof PLAN_DETAILS

export function calculateGstBreakdown(totalInclusive: number) {
  const gstAmount = Math.round((totalInclusive * 0.18) / 1.18)
  const baseAmount = totalInclusive - gstAmount
  return { baseAmount, gstAmount, total: totalInclusive }
}

export function getPlanLabel(planType: string): string {
  const details = PLAN_DETAILS[planType as PlanKey]
  if (!details) return planType
  return `${details.name} ${details.duration}`
}
