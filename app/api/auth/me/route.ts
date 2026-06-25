import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * Lightweight session check — checks the JWT cookie and verifies the latest role from the DB.
 * Used by the Header to detect login state and exact role.
 */
export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ user: null }, { status: 200 })
  }

  // Fetch fresh role from DB so UI doesn't show stale JWT data
  const dbUser = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true }
  })

  if (!dbUser) {
    return NextResponse.json({ user: null }, { status: 200 })
  }

  return NextResponse.json({ user: { userId: session.userId, role: dbUser.role } })
}
