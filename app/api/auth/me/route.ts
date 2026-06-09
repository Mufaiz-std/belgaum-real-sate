import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

/**
 * Lightweight session check — reads the JWT cookie only, NO database hit.
 * Used by the Header to detect login state instantly.
 */
export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ user: null }, { status: 200 })
  }
  return NextResponse.json({ user: { userId: session.userId, role: session.role } })
}
