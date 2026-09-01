import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/oracle/pool'
import bcrypt from 'bcrypt'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    const users: any = await executeQuery(
      `SELECT id, email, password_hash, full_name, role FROM users WHERE email = :1`,
      [email]
    )

    const user = users[0]
    if (!user) return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 })

    // Karena OUT_FORMAT_OBJECT jadi huruf besar semua
    const valid = await bcrypt.compare(password, user.PASSWORD_HASH)
    if (!valid) return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 })

    const res = NextResponse.json({
      success: true,
      user: { id: user.ID, email: user.EMAIL, name: user.FULL_NAME, role: user.ROLE }
    })

    res.cookies.set('user', JSON.stringify({ id: user.ID, email: user.EMAIL }), {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    })

    return res
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal login' }, { status: 500 })
  }
}
