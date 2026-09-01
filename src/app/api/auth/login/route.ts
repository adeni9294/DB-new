export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { executeQuery } from '@/lib/oracle/pool'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
  
    if (!email ||!password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 })
    }

    // Ambil user dari oracle
    const users = await executeQuery(
      `SELECT ID, EMAIL, FULL_NAME, PASSWORD_HASH FROM USERS WHERE EMAIL = :1`,
      [email]
    )

    const user = users[0]
    if (!user) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 401 })

    const isValid = await bcrypt.compare(password, user.PASSWORD_HASH)
    if (!isValid) return NextResponse.json({ error: 'Password salah' }, { status: 401 })

    const res = NextResponse.json({ success: true, user: { id: user.ID, name: user.FULL_NAME } })
    
    // PENTING: secure HARUS true di Vercel
    res.cookies.set('user', JSON.stringify({ id: user.ID, email: user.EMAIL, name: user.FULL_NAME }), {
      httpOnly: true,
      secure: true, // <--- UDAH FIX. JANGAN DIUBAH LAGI
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 hari
    })
    return res

  } catch (error: any) {
    console.error('LOGIN ERROR:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server: ' + error.message }, { status: 500 })
  }
}
