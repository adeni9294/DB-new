import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getPool } from '@/lib/oracle/pool';

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 32, 'sha512').toString('hex');
}

export async function POST(request: Request) {
  let connection;

  try {
    const { email, password, fullName } = await request.json();

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { message: 'Nama lengkap, email, dan password wajib diisi' },
        { status: 400 }
      );
    }

    const pool = await getPool();
    connection = await pool.getConnection();

    // Cek keberadaan user
    const checkUser = await connection.execute(
      `SELECT id FROM app_users WHERE email = :email`,
      [email.toLowerCase()]
    );

    if (checkUser.rows && checkUser.rows.length > 0) {
      return NextResponse.json(
        { message: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }

    // Generate Salt & Hash
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, salt);

    // Insert user baru
    await connection.execute(
      `INSERT INTO app_users (id, email, password_hash, salt, name, role, created_at)
       VALUES (SYS_GUID(), :email, :passwordHash, :salt, :fullName, 'user', SYSDATE)`,
      [email.toLowerCase(), passwordHash, salt, fullName],
      { autoCommit: true }
    );

    return NextResponse.json(
      { message: 'Registrasi berhasil! Silakan login.' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json(
      { message: error.message || 'Gagal mendaftar pengguna baru' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
}
