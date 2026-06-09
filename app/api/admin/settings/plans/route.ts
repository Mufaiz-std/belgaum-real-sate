import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  try {
    await requireAdmin()
    const plans = await prisma.planConfig.findMany({ orderBy: { price: 'asc' } })
    return NextResponse.json({ plans })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin()
    const body = await req.json()
    const { id, name, duration, durationDays, price, dailyLimit, badge } = body

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const plan = await prisma.planConfig.update({
      where: { id },
      data: {
        name,
        duration,
        durationDays: Number(durationDays),
        price: Number(price),
        dailyLimit: Number(dailyLimit),
        badge: badge || null,
      },
    })
    return NextResponse.json({ plan })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 })
  }
}
