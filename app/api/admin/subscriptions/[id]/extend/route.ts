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
    const { days } = z.object({ days: z.number().min(1).max(365) }).parse(await req.json())

    const sub = await prisma.subscription.findUnique({ where: { id } })
    if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const expiryDate = new Date(sub.expiryDate)
    expiryDate.setDate(expiryDate.getDate() + days)

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
