import { PrismaClient } from '@prisma/client'
import { BELAGAVI_AREAS } from '../lib/constants'
import { PLAN_DETAILS, PLAN_AMOUNTS } from '../lib/pricing'

const prisma = new PrismaClient()

const PROPERTY_TYPES = [
  'HOUSE',
  'APARTMENT',
  'VILLA',
  'PLOT',
  'COMMERCIAL',
  'AGRICULTURAL',
]

async function main() {
  console.log('Seeding areas...')
  for (const areaName of BELAGAVI_AREAS) {
    await prisma.area.upsert({
      where: { name: areaName },
      update: {},
      create: { name: areaName },
    })
  }

  console.log('Seeding property types...')
  for (const typeName of PROPERTY_TYPES) {
    await prisma.propertyTypeConfig.upsert({
      where: { name: typeName },
      update: {},
      create: { name: typeName },
    })
  }

  console.log('Seeding plans...')
  for (const [key, details] of Object.entries(PLAN_DETAILS)) {
    await prisma.planConfig.upsert({
      where: { planKey: key },
      update: {
        name: details.name,
        duration: details.duration,
        durationDays: details.durationDays,
        price: PLAN_AMOUNTS[key as keyof typeof PLAN_AMOUNTS],
        badge: details.badge,
        features: details.features as any,
      },
      create: {
        planKey: key,
        name: details.name,
        duration: details.duration,
        durationDays: details.durationDays,
        price: PLAN_AMOUNTS[key as keyof typeof PLAN_AMOUNTS],
        badge: details.badge,
        features: details.features as any,
      },
    })
  }

  // Also add the SINGLE plan which isn't in PLAN_DETAILS
  await prisma.planConfig.upsert({
    where: { planKey: 'SINGLE' },
    update: {
      name: 'Single Property',
      duration: 'Lifetime',
      durationDays: 36500, // 100 years
      price: PLAN_AMOUNTS.SINGLE,
      badge: null,
      features: {
        contactAccess: false,
        uploadProperties: true,
        dailyViews: false,
        prioritySupport: false,
        featuredListings: false,
      },
      dailyLimit: 0,
    },
    create: {
      planKey: 'SINGLE',
      name: 'Single Property',
      duration: 'Lifetime',
      durationDays: 36500,
      price: PLAN_AMOUNTS.SINGLE,
      badge: null,
      features: {
        contactAccess: false,
        uploadProperties: true,
        dailyViews: false,
        prioritySupport: false,
        featuredListings: false,
      },
      dailyLimit: 0,
    },
  })

  console.log('Seed completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
