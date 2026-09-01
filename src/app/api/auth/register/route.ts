import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/oracle/pool'
import bcrypt from 'bcryptjs' // BENER

export async function POST(req: Request) {
  try {
    const { email, password, full_name } = await req.json()
    const password_hash = await bcrypt.hash(password, 10)

    await executeQuery(
      `INSERT INTO users (email, password_hash, full_name) VALUES (:1, :2, :3)`,
      [email, password_hash, full_name]
    )

    return NextResponse.json({ success: true, message: 'Registrasi berhasil' })
  } catch (error: any) {
    if (error.errorNum === 1) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 })
    }
    console.error(error)
    return NextResponse.json({ error: 'Gagal registrasi' }, { status: 500 })
  }
}
