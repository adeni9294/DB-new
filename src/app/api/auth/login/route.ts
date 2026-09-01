import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs' // ini udah bener
import { cookies } from 'next/headers'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  const { email, password } = await req.json()
  
  //... ambil user dari db
  
  const isValid = await bcrypt.compare(password, user.PASSWORD)
  if (!isValid) return NextResponse.json({ error: 'Password salah' }, { status: 401 })

  const res = NextResponse.json({ success: true })
  res.cookies.set('user', JSON.stringify({ id: user.ID, email: user.EMAIL, name: user.FULL_NAME }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  })
  return res
}
