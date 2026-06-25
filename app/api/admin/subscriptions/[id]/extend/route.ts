import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireCsrfForMutation, handleApiError } from '@/lib/api-utils'
import { z } from 'zod'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireCsrfForMutation(req)
    await requireAdmin()
    const { id } = await params
    const body = await req.json()

    // Support both old format (days) and new format (newExpiryDate)
    const schema = z.union([
      z.object({ newExpiryDate: z.string() }),
      z.object({ days: z.number().min(1).max(365) }),
    ])
    const parsed = schema.parse(body)

    const sub = await prisma.subscription.findUnique({ where: { id } })
    if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    let expiryDate: Date

    if ('newExpiryDate' in parsed) {
      // Set expiry to midnight (00:00:00) of the selected date
      expiryDate = new Date(parsed.newExpiryDate)
      expiryDate.setHours(0, 0, 0, 0)

      if (expiryDate <= new Date()) {
        return NextResponse.json({ error: 'Date must be in the future' }, { status: 400 })
      }
    } else {
      // Legacy: extend by days from current expiry
      expiryDate = new Date(sub.expiryDate)
      expiryDate.setDate(expiryDate.getDate() + parsed.days)
    }

    const updated = await prisma.subscription.update({
      where: { id },
      data: { expiryDate, status: 'ACTIVE' },
    })

    return NextResponse.json({ subscription: updated })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 })
    }
    return handleApiError(err)
  }
}

