export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { executeQuery } from '@/lib/oracle/pool'

async function withTimeout<T>(p: Promise<T>, ms: number) {
  let timer: NodeJS.Timeout
  return await Promise.race([
    p,
    new Promise<T>((_, reject) => {
      timer = setTimeout(() => reject(new Error('timeout')), ms)
    }),
  ]).finally(() => clearTimeout(timer))
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    // basic validation
    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 })
    }

    // execute query with timeout to avoid server hanging if DB is down
    let users: any[] = []
    try {
      users = await withTimeout(executeQuery(`SELECT * FROM USERS WHERE EMAIL = :1`, [email]), 8000)
    } catch (e: any) {
      console.error('DB query failed or timed out', e)
      return NextResponse.json({ error: 'Gagal terhubung ke database' }, { status: 504 })
    }

    const user = users && users[0]
    if (!user) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 401 })

    let isValid = false
    try {
      isValid = await bcrypt.compare(password, user.PASSWORD_HASH)
    } catch (e) {
      // bcrypt.compare mungkin error bila hash tidak valid — tangani sebagai false
      console.error('bcrypt.compare error', e)
      isValid = false
    }

    // migrasi user lama (password tersimpan plaintext pada DB lama)
    if (!isValid && password === user.PASSWORD_HASH) {
      isValid = true
      try {
        const newHash = await bcrypt.hash(password, 10)
        await executeQuery(`UPDATE USERS SET PASSWORD_HASH = :1 WHERE ID = :2`, [newHash, user.ID])
      } catch (e) {
        console.error('Gagal update hash password:', e)
      }
    }

    if (!isValid) return NextResponse.json({ error: 'Password salah' }, { status: 401 })

    // set cookie dengan cara yang eksplisit pada response supaya pasti terkirim
    const cookieValue = JSON.stringify({ id: user.ID, email: user.EMAIL, name: user.FULL_NAME || email })
    const res = NextResponse.json({ success: true })

    // set cookie untuk response
    res.cookies.set('user', cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return res
  } catch (err) {
    // Tangani error server (DB down / koneksi / runtime errors)
    console.error('Login handler error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
