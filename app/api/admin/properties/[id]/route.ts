import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PropertyStatus } from '@prisma/client'
import { requireCsrfForMutation, handleApiError } from '@/lib/api-utils'
import { z } from 'zod'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        amenities: true,
        owner: { select: { id: true, name: true, phone: true, email: true } },
      },
    })

    if (!property) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ property })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireCsrfForMutation(req)
    await requireAdmin()
    const { id } = await params
    const body = await req.json()

    const schema = z.object({
      status: z.enum(['PENDING', 'ACTIVE', 'SOLD', 'EXPIRED', 'REJECTED']).optional(),
      isFeatured: z.boolean().optional(),
    })
    const data = schema.parse(body)

    const property = await prisma.property.update({
      where: { id },
      data,
    })

    return NextResponse.json({ property })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 })
    }
    return handleApiError(err)
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireCsrfForMutation(req)
    await requireAdmin()
    const { id } = await params

    await prisma.property.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    return handleApiError(err)
  }
}
