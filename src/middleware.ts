import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const userCookie = request.cookies.get('user')
  const { pathname } = request.nextUrl

  const isLoggedIn = !!userCookie

  const publicPaths = ['/login', '/register', '/api/auth/login']
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))

  // 1. Kalau belum login dan akses halaman protected -> tendang ke login
  if (!isLoggedIn && !isPublicPath && pathname !== '/') {
    const url = new URL('/login', request.url)
    url.searchParams.set('redirect', pathname) // biar abis login balik ke halaman tujuan
    return NextResponse.redirect(url)
  }

  // 2. Kalau UDAH login dan buka /login atau / -> tendang ke dashboard
  if (isLoggedIn && (pathname === '/login' || pathname === '/')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Cuma jalan di route ini. API dan static gak dicek biar enteng
  matcher: ['/', '/dashboard/:path*', '/login', '/register'],
}
