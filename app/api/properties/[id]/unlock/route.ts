import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/api-utils'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session) return NextResponse.json({ unlocked: false })

    const unlock = await prisma.propertyUnlock.findFirst({
      where: { userId: session.userId, propertyId: id },
    })

    return NextResponse.json({ unlocked: !!unlock })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const property = await prisma.property.findUnique({
      where: { id },
      select: { isFree: true, ownerId: true }
    })

    if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    
    if (!property.isFree && property.ownerId !== session.userId) {
      return NextResponse.json({ error: 'Property is not free to unlock directly' }, { status: 403 })
    }

    const existingUnlock = await prisma.propertyUnlock.findFirst({
      where: { userId: session.userId, propertyId: id },
    })

    if (!existingUnlock) {
      await prisma.propertyUnlock.create({
        data: {
          userId: session.userId,
          propertyId: id,
          paymentId: `free_unlock_${Date.now()}_${session.userId}`,
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return handleApiError(err)
  }
}
