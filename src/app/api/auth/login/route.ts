import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db' // ganti sesuai db kamu

export async function POST(req: Request) {
  const { email, password } = await req.json()

  //... logic cek user ke db kamu...
  const user = { id: 1, email, name: 'Admin' } // contoh

  const res = NextResponse.json({ success: true })

  res.cookies.set('user', JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // WAJIB true di vercel
    sameSite: 'lax', // WAJIB biar dikirim antar route
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 7 hari
  })

  return res
}
