import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const userCookie = request.cookies.get('user')
  const { pathname } = request.nextUrl

  const protectedRoutes = ['/dashboard']
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route))

  // Kalau mau ke dashboard tapi belum login
  if (isProtected &&!userCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Kalau udah login tapi buka / atau /login
  if (userCookie && (pathname === '/login' || pathname === '/')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
