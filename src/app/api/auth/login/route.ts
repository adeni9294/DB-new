import { NextResponse } from 'next/server';
import crypto from 'crypto';
import oracledb from 'oracledb';
import { getPool } from '@/lib/oracle/pool';

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha512').toString('hex'); // SAMA PERSIS
}

export async function POST(req: Request) {
  let connection;
  try {
    const { email, password } = await req.json();
    const pool = await getPool();
    connection = await pool.getConnection();

    const result = await connection.execute(
      `SELECT id, name, email, password_hash, salt FROM app_users WHERE LOWER(TRIM(email)) = :email`,
      [email.toLowerCase().trim()],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    await connection.close();

    const user = result.rows?.[0];
    if (!user) {
      return NextResponse.json({ message: 'Email tidak ditemukan' }, { status: 401 });
    }

    // HASH PAKE SALT DARI DB
    const saltFromDb = user.SALT;
    const hash = hashPassword(password, saltFromDb);

    if (hash!== user.PASSWORD_HASH) {
      return NextResponse.json({ message: 'Password yang dimasukkan salah' }, { status: 401 });
    }

    return NextResponse.json({ 
      message: 'Login berhasil', 
      user: { id: user.ID, email: user.EMAIL, name: user.NAME } 
    });

  } catch (error: any) {
    console.error('Login error:', error);
    if (connection) await connection.close();
    return NextResponse.json({ message: 'Server Error: ' + error.message }, { status: 500 });
  }
}
