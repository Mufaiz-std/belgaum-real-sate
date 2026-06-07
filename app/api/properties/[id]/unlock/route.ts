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
