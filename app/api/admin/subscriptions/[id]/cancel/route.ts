import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireCsrfForMutation, handleApiError } from '@/lib/api-utils'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireCsrfForMutation(req)
    await requireAdmin()
    const { id } = await params

    const updated = await prisma.subscription.update({
      where: { id },
      data: { status: 'CANCELLED' },
    })

    return NextResponse.json({ subscription: updated })
  } catch (err) {
    return handleApiError(err)
  }
}
