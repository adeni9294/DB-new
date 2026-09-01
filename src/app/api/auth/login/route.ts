export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers' // <-- PENTING
import { executeQuery } from '@/lib/oracle/pool'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    
    const users = await executeQuery(
      `SELECT ID, EMAIL, FULL_NAME, PASSWORD_HASH FROM USERS WHERE EMAIL = :1`,
      [email]
    )
    const user = users[0]
    if (!user) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 401 })

    const isValid = await bcrypt.compare(password, user.PASSWORD_HASH)
    if (!isValid) return NextResponse.json({ error: 'Password salah' }, { status: 401 })

    const cookieStore = await cookies() // <-- PAKAI INI DOANG
    cookieStore.set({
      name: 'user',
      value: JSON.stringify({ id: user.ID, email: user.EMAIL, name: user.FULL_NAME }),
      httpOnly: true, // <-- INI YG BIKIN TRUE
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
