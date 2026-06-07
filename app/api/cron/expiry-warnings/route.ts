import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendSubscriptionExpiryWarning } from '@/services/notificationService'

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const threeDaysFromNow = new Date()
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  const expiringSoon = await prisma.subscription.findMany({
    where: {
      status: 'ACTIVE',
      expiryDate: {
        gte: tomorrow,
        lte: threeDaysFromNow,
      },
    },
    include: {
      user: { select: { email: true, name: true, phone: true } },
    },
  })

  let notified = 0
  for (const sub of expiringSoon) {
    if (sub.user.email) {
      await sendSubscriptionExpiryWarning({
        to: sub.user.email,
        customerName: sub.user.name ?? '',
        expiryDate: sub.expiryDate,
        planType: sub.planType,
      })
      notified++
    }
  }

  await prisma.subscription.updateMany({
    where: { status: 'ACTIVE', expiryDate: { lt: new Date() } },
    data: { status: 'EXPIRED' },
  })

  const expiredSubs = await prisma.subscription.findMany({
    where: {
      status: 'EXPIRED',
      updatedAt: { gte: new Date(Date.now() - 60000) },
    },
    select: { userId: true },
  })

  for (const sub of expiredSubs) {
    const hasOtherActive = await prisma.subscription.findFirst({
      where: { userId: sub.userId, status: 'ACTIVE' },
    })
    if (!hasOtherActive) {
      await prisma.user.update({
        where: { id: sub.userId },
        data: { role: 'USER' },
      })
    }
  }

  return NextResponse.json({ success: true, notified })
}
