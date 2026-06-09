import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [areas, propertyTypes, plans] = await Promise.all([
      prisma.area.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
      prisma.propertyTypeConfig.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
      prisma.planConfig.findMany({ where: { isActive: true }, orderBy: { price: 'asc' } }),
    ])

    return NextResponse.json({
      areas,
      propertyTypes,
      plans,
    })
  } catch (err) {
    console.error('Failed to fetch public settings', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
