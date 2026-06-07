import { NextRequest, NextResponse } from 'next/server'
import { getProperties, sanitizeProperty } from '@/services/propertyService'
import { apiLimiter } from '@/lib/rate-limit'
import { getClientIp, handleApiError } from '@/lib/api-utils'
import { PropertyType } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const ip = await getClientIp()
    apiLimiter.check(ip)
  } catch {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    const { searchParams } = req.nextUrl
    const filters = {
      area: searchParams.get('area') ?? undefined,
      propertyType: (searchParams.get('type') as PropertyType) ?? undefined,
      priceMin: searchParams.get('priceMin') ? Number(searchParams.get('priceMin')) : undefined,
      priceMax: searchParams.get('priceMax') ? Number(searchParams.get('priceMax')) : undefined,
      bedrooms: searchParams.get('bedrooms') ? Number(searchParams.get('bedrooms')) : undefined,
      search: searchParams.get('q') ?? undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: 12,
      sortBy: (searchParams.get('sort') as 'newest' | 'price_asc' | 'price_desc') ?? 'newest',
    }

    const { properties, pagination } = await getProperties(filters)
    const sanitized = properties.map((p) => sanitizeProperty(p, 'GUEST'))

    return NextResponse.json({ properties: sanitized, pagination })
  } catch (err) {
    return handleApiError(err)
  }
}
