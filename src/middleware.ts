import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // MATIIN DULU CEK TOKEN. BIARIN SEMUA LEWAT
  // NANTI CEK NYA KITA HANDLE DI DASHBOARD PAGE PAKE useEffect
  
  // 1. Cuma sisa Security Headers aja
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/structure/:path*',
    '/events/:path*',
    '/tools/:path*',
    '/reports/:path*',
    '/login',
    '/register',
  ],
};
