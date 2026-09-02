import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const userCookie = request.cookies.get('user')
  const { pathname } = request.nextUrl

  const isLoggedIn = !!userCookie

  // Jika SUDAH login dan mencoba buka halaman login/register,
  // langsung alihkan ke /dashboard agar tidak login dua kali.
  if (isLoggedIn && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Semua halaman lain (termasuk '/', '/dashboard', '/keuangan', dll) 
  // diizinkan diakses bebas oleh siapa saja (Mode Publik / Read-Only).
  return NextResponse.next()
}

export const config = {
  // Jalankan middleware hanya pada rute halaman utama, dashboard, dan auth
  matcher: ['/', '/dashboard/:path*', '/login', '/register'],
}
