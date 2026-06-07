import { NextResponse } from 'next/server'
import { requireAuth, getAccessLevel } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { requireCsrfForMutation, handleApiError } from '@/lib/api-utils'

const leadSchema = z.object({
  propertyId: z.string(),
  message: z.string().min(10).max(500),
})

export async function POST(req: Request) {
  try {
    await requireCsrfForMutation(req)
    const session = await requireAuth()
    const body = await req.json()
    const { propertyId, message } = leadSchema.parse(body)

    const accessLevel = await getAccessLevel(session.userId, propertyId)
    if (accessLevel === 'GUEST' || accessLevel === 'REGISTERED') {
      return NextResponse.json({ error: 'Purchase access first' }, { status: 403 })
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { ownerId: true },
    })
    if (!property) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const lead = await prisma.lead.create({
      data: {
        propertyId,
        buyerId: session.userId,
        ownerId: property.ownerId,
        message,
      },
    })

    return NextResponse.json({ success: true, leadId: lead.id })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 })
    }
    return handleApiError(err)
  }
}
