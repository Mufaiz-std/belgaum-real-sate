import { NextRequest, NextResponse } from 'next/server'
import {
  getPropertyBySlug,
  sanitizeProperty,
  incrementViewCount,
} from '@/services/propertyService'
import { getSession, getAccessLevel } from '@/lib/auth'
import { handleApiError } from '@/lib/api-utils'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getSession()
    const property = await getPropertyBySlug(id)

    if (
      !property ||
      property.status === 'PENDING' ||
      property.status === 'REJECTED'
    ) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    const accessLevel = await getAccessLevel(session?.userId ?? null, property.id)

    await incrementViewCount(property.id)

    const sanitized = sanitizeProperty(property, accessLevel)
    return NextResponse.json({ property: sanitized, accessLevel })
  } catch (err) {
    return handleApiError(err)
  }
}
