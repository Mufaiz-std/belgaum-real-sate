import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PropertyStatus } from '@prisma/client'
import { requireCsrfForMutation, handleApiError } from '@/lib/api-utils'
import { z } from 'zod'

const bulkSchema = z.object({
  ids: z.array(z.string()).min(1),
  action: z.enum(['approve', 'reject', 'delete']),
  reason: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    await requireCsrfForMutation(req)
    await requireAdmin()
    const { ids, action, reason } = bulkSchema.parse(await req.json())

    if (action === 'delete') {
      await prisma.property.deleteMany({ where: { id: { in: ids } } })
      return NextResponse.json({ success: true, count: ids.length })
    }

    const status: PropertyStatus = action === 'approve' ? 'ACTIVE' : 'REJECTED'
    await prisma.property.updateMany({
      where: { id: { in: ids } },
      data: { status },
    })

    return NextResponse.json({ success: true, count: ids.length, reason })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 })
    }
    return handleApiError(err)
  }
}
