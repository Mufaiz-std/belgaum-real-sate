import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const PROTECTED_ROUTES = ['/dashboard', '/admin']
const ADMIN_ROUTES = ['/admin']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('session')?.value

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r))
  if (!isProtected) return NextResponse.next()

  if (!token) {
    return NextResponse.redirect(new URL('/login?redirect=' + pathname, req.url))
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jwtVerify(token, secret)

    const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r))
    if (isAdminRoute && payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
