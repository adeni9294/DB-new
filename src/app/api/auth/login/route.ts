import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getPool } from '@/lib/oracle/pool';

function hashPassword(password: string): string {
  return crypto.pbkdf2Sync(password, 'static_salt', 1000, 32, 'sha512').toString('hex');
}

export async function POST(request: Request) {
  let connection;

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email dan password wajib diisi' }, { status: 400 });
    }

    const pool = await getPool();
    connection = await pool.getConnection();

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password).trim();

    const result = await connection.execute(
      `SELECT id, email, password_hash, name, role 
       FROM app_users 
       WHERE LOWER(TRIM(email)) = :email`,
      [cleanEmail]
    );

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json({ message: 'Email tidak terdaftar' }, { status: 401 });
    }

    const rowData = result.rows[0] as any[];
    const userId = rowData[0];
    const userEmail = rowData[1];
    const rawStoredHash = String(rowData[2] || '');
    const userName = rowData[3];
    const userRole = rowData[4];

    // Ambil 64 karakter pertama dari masing-masing hash untuk menghindari isu trailing space Oracle
    const storedHash = rawStoredHash.replace(/[^a-fA-F0-9]/g, '').toLowerCase().slice(0, 64);
    const inputHash = hashPassword(cleanPassword).replace(/[^a-fA-F0-9]/g, '').toLowerCase().slice(0, 64);

    if (inputHash !== storedHash) {
      return NextResponse.json({ message: 'Password yang dimasukkan salah' }, { status: 401 });
    }

    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    try {
      await connection.execute(
        `INSERT INTO app_user_sessions (id, user_id, session_token, expires_at)
         VALUES (SYS_GUID(), :userId, :sessionToken, :expiresAt)`,
        [userId, sessionToken, expiresAt],
        { autoCommit: true }
      );
    } catch (sessionErr: any) {
      console.error('Session Insert Warning:', sessionErr);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil',
      user: { id: userId, email: userEmail, name: userName, role: userRole },
    });

    response.cookies.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Login Error:', error);
    return NextResponse.json(
      { message: error.message || 'Terjadi kesalahan pada server' },
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
