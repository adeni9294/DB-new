export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers' // <-- INI KUNCI
import { executeQuery } from '@/lib/oracle/pool'

export async function POST(req: Request) {
  const { email, password } = await req.json()
  
  const users = await executeQuery(`SELECT * FROM USERS WHERE EMAIL = :1`, [email])
  const user = users[0]
  if (!user) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 401 })

  let isValid = await bcrypt.compare(password, user.PASSWORD_HASH)
  if (!isValid && password === user.PASSWORD_HASH) { // migrasi user lama
    isValid = true 
    const newHash = await bcrypt.hash(password, 10)
    await executeQuery(`UPDATE USERS SET PASSWORD_HASH = :1 WHERE ID = :2`, [newHash, user.ID])
  }
  if (!isValid) return NextResponse.json({ error: 'Password salah' }, { status: 401 })

  const cookieStore = await cookies() // <-- PAKAI INI BUKAN res.cookies.set
  cookieStore.set('user', JSON.stringify({ id: user.ID, email: user.EMAIL, name: user.FULL_NAME || email }), {
    httpOnly: true, // <-- INI HARUS TRUE
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  })

  return NextResponse.json({ success: true })
}
