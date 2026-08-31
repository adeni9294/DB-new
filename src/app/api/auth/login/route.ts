import crypto from 'crypto';
import { getConnection } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const connection = await getConnection();

    const result = await connection.execute(
      `SELECT * FROM app_users WHERE LOWER(email) = :email`,
      [email.toLowerCase()]
    );

    const user = result.rows?.[0];
    if (!user) {
      return NextResponse.json({ message: 'Email tidak ditemukan' }, { status: 401 });
    }

    // INI KUNCINYA: AMBIL SALT DARI DB DULU
    const saltFromDb = user[5]; // index ke 5 = kolom SALT. Cek urutan SELECT * kamu
    // kalau pake nama kolom lebih aman:
    // const saltFromDb = user.SALT; 

    // HASH ULANG PASSWORD INPUT PAKE SALT YG SAMA
    const hash = crypto.pbkdf2Sync(password, saltFromDb, 100000, 32, 'sha512').toString('hex');

    // BANDINGKAN DENGAN HASH DI DB
    if (hash!== user[3]) { // index ke 3 = kolom PASSWORD_HASH
      return NextResponse.json({ message: 'Password yang dimasukkan salah' }, { status: 401 });
    }

    // SUKSES - BUAT SESSION DLL
    return NextResponse.json({ message: 'Login berhasil', user: { email: user[2], name: user[1] } });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}
