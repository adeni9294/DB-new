export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { executeQuery } from '@/lib/oracle/pool'

export async function POST(req: Request) {
  const { email, password } = await req.json()
  
  const users = await executeQuery(
    `SELECT ID, EMAIL, FULL_NAME, PASSWORD_HASH FROM USERS WHERE EMAIL = :1`,
    [email]
  )
  const user = users[0]
  if (!user) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 401 })

  const isValid = await bcrypt.compare(password, user.PASSWORD_HASH)
  if (!isValid) return NextResponse.json({ error: 'Password salah' }, { status: 401 })

  const cookieStore = await cookies()
  cookieStore.set('user', JSON.stringify({ id: user.ID, email: user.EMAIL, name: user.FULL_NAME }), {
    httpOnly: true,
    secure: true, // WAJIB TRUE DI VERCEL
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  })

  return NextResponse.json({ success: true })
}
