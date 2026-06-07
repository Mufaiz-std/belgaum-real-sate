import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const session = await requireAuth()

    await prisma.user.update({
      where: { id: session.userId },
      data: { status: 'BANNED' },
    })

    const cookieStore = await cookies()
    cookieStore.delete('session')

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
