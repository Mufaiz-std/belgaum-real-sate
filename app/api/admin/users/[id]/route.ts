import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Role, UserStatus } from '@prisma/client'
import { requireCsrfForMutation, handleApiError } from '@/lib/api-utils'
import { z } from 'zod'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        subscriptions: { orderBy: { createdAt: 'desc' }, take: 5 },
        properties: { take: 10, orderBy: { createdAt: 'desc' } },
        payments: { take: 10, orderBy: { createdAt: 'desc' } },
        dailyUsage: { orderBy: { date: 'desc' }, take: 7 },
        _count: { select: { properties: true, payments: true } },
      },
    })

    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ user })
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
      role: z.enum(['USER', 'SUBSCRIBER', 'ADMIN']).optional(),
      status: z.enum(['ACTIVE', 'INACTIVE', 'BANNED']).optional(),
    })
    const data = schema.parse(body)

    const user = await prisma.user.update({
      where: { id },
      data,
    })

    return NextResponse.json({ user })
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

    await prisma.user.update({
      where: { id },
      data: { status: 'BANNED' as UserStatus },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    return handleApiError(err)
  }
}
