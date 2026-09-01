import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ success: true, message: 'Logout berhasil' })
  res.cookies.set('user', '', { maxAge: -1, path: '/' })
  return res
}
