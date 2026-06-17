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
      // Check if user has an active subscription
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId: session.userId,
          status: 'ACTIVE',
          expiryDate: { gt: new Date() },
        },
      })

      if (!subscription) {
        return NextResponse.json({ error: 'Property is not free and no active subscription found' }, { status: 403 })
      }

      // Check daily limit
      const startOfDay = new Date()
      startOfDay.setUTCHours(0, 0, 0, 0)

      let dailyUsage = await prisma.dailyUsage.findUnique({
        where: {
          userId_date: {
            userId: session.userId,
            date: startOfDay,
          },
        },
      })

      if (!dailyUsage) {
        dailyUsage = await prisma.dailyUsage.create({
          data: { userId: session.userId, date: startOfDay, viewsUsed: 0 },
        })
      }

      if (dailyUsage.viewsUsed >= subscription.dailyLimit) {
        return NextResponse.json({ error: 'Daily limit exceeded' }, { status: 403 })
      }

      // Use transaction to update usage and create unlock
      const existingUnlock = await prisma.propertyUnlock.findFirst({
        where: { userId: session.userId, propertyId: id },
      })

      if (!existingUnlock) {
        await prisma.$transaction([
          prisma.dailyUsage.update({
            where: { id: dailyUsage.id },
            data: { viewsUsed: { increment: 1 } },
          }),
          prisma.propertyUnlock.create({
            data: {
              userId: session.userId,
              propertyId: id,
              paymentId: `sub_unlock_${Date.now()}_${session.userId}`,
            },
          }),
        ])
      }
      return NextResponse.json({ success: true })
    }

    // Property is free or user is owner
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
