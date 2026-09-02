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
  const reqId = Date.now()
  try {
    const body = await req.json()
    const email = body?.email
    // do not log passwords
    console.log(`[login:${reqId}] start`, { email })

    // basic validation
    if (!email || !body.password) {
      console.log(`[login:${reqId}] validation failed - missing fields`)
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 })
    }

    // execute query with timeout to avoid server hanging if DB is down
    let users: any[] = []
    try {
      console.log(`[login:${reqId}] before query for email=${email}`)
      users = await withTimeout(executeQuery(`SELECT * FROM USERS WHERE EMAIL = :1`, [email]), 8000)
      console.log(`[login:${reqId}] after query - rows=${users?.length}`)
    } catch (e: any) {
      console.error(`[login:${reqId}] DB query failed or timed out`, e)
      return NextResponse.json({ error: 'Gagal terhubung ke database' }, { status: 504 })
    }

    const user = users && users[0]
    if (!user) {
      console.log(`[login:${reqId}] user not found for email=${email}`)
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 401 })
    }

    console.log(`[login:${reqId}] user found id=${user.ID}`)

    let isValid = false
    try {
      isValid = await bcrypt.compare(body.password, user.PASSWORD_HASH)
    } catch (e) {
      // bcrypt.compare mungkin error bila hash tidak valid — tangani sebagai false
      console.error(`[login:${reqId}] bcrypt.compare error`, e)
      isValid = false
    }

    // migrasi user lama (password tersimpan plaintext pada DB lama)
    if (!isValid && body.password === user.PASSWORD_HASH) {
      isValid = true
      try {
        console.log(`[login:${reqId}] detected plaintext password, migrating hash for id=${user.ID}`)
        const newHash = await bcrypt.hash(body.password, 10)
        await executeQuery(`UPDATE USERS SET PASSWORD_HASH = :1 WHERE ID = :2`, [newHash, user.ID])
        console.log(`[login:${reqId}] migrated password hash for id=${user.ID}`)
      } catch (e) {
        console.error(`[login:${reqId}] Gagal update hash password:`, e)
      }
    }

    if (!isValid) {
      console.log(`[login:${reqId}] invalid password for id=${user.ID}`)
      return NextResponse.json({ error: 'Password salah' }, { status: 401 })
    }

    // set cookie dengan cara yang eksplisit pada response supaya pasti terkirim
    const cookieValue = JSON.stringify({ id: user.ID, email: user.EMAIL, name: user.FULL_NAME || email })
    const res = NextResponse.json({ success: true })

    try {
      // set cookie untuk response
      res.cookies.set('user', cookieValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      })
      console.log(`[login:${reqId}] cookie set for id=${user.ID}`)
    } catch (e) {
      console.error(`[login:${reqId}] failed to set cookie`, e)
    }

    console.log(`[login:${reqId}] success for id=${user.ID}`)
    return res
  } catch (err) {
    console.error(`[login:${Date.now()}] Login handler error:`, err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
