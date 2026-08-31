import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getPool } from '@/lib/oracle/pool';

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 32, 'sha512').toString('hex');
}

export async function POST(request: Request) {
  let connection;
  try {
    const { email, password } = await request.json();

    const pool = await getPool();
    connection = await pool.getConnection();

    const result = await connection.execute(
      `SELECT id, name, email, password_hash, salt FROM app_users WHERE email = :email`,
      [email.toLowerCase()]
    );

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json({ message: 'Email atau password salah' }, { status: 401 });
    }

    const user = result.rows[0] as any[];
    const [id, name, userEmail, passwordHash, salt] = user;

    // HASH PASSWORD INPUT DENGAN SALT DARI DB
    const inputHash = hashPassword(password, salt);

    // BANDINGKAN HASH
    if (inputHash!== passwordHash) {
      return NextResponse.json({ message: 'Password yang dimasukkan salah' }, { status: 401 });
    }

    return NextResponse.json({ 
      message: 'Login berhasil', 
      user: { id, name, email: userEmail } 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Gagal login' }, { status: 500 });
  } finally {
    if (connection) await connection.close();
  }
}
