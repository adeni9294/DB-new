import crypto from 'crypto';
import oracledb from 'oracledb';
import { getPool } from '@/lib/oracle/pool';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const pool = await getPool();
    const connection = await pool.getConnection();

    const result = await connection.execute(
      `SELECT id, name, email, password_hash, salt FROM app_users WHERE LOWER(email) = :email`,
      [email.toLowerCase()],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    await connection.close();

    const user = result.rows?.[0];
    if (!user) {
      return NextResponse.json({ message: 'Email tidak ditemukan' }, { status: 401 });
    }

    const saltFromDb = user.SALT;
    const hash = crypto.pbkdf2Sync(password, saltFromDb, 100000, 32, 'sha512').toString('hex');

    if (hash!== user.PASSWORD_HASH) {
      return NextResponse.json({ message: 'Password yang dimasukkan salah' }, { status: 401 });
    }

    return NextResponse.json({ message: 'Login berhasil', user: { id: user.ID, email: user.EMAIL, name: user.NAME } });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: 'Server Error: ' + error.message }, { status: 500 });
  }
}
