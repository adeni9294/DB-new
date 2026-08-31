import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getPool } from '@/lib/oracle/pool';

function hashPassword(password: string, salt: string): string { // <-- TAMBAH PARAM SALT
  return crypto.pbkdf2Sync(password, salt, 1000, 32, 'sha512').toString('hex');
}

export async function POST(request: Request) {
  let connection;
  try {
    const { email, password } = await request.json();
    if (!email ||!password) {
      return NextResponse.json({ message: 'Email dan password wajib diisi' }, { status: 400 });
    }

    const pool = await getPool();
    connection = await pool.getConnection();

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password).trim();

    // 1. SELECT SALT JUGA
    const result = await connection.execute(
      `SELECT id, email, password_hash, salt, name, role 
       FROM app_users 
       WHERE LOWER(TRIM(email)) = :email`, // pake bind biar aman
      [cleanEmail]
    );

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json({ message: 'Email tidak terdaftar' }, { status: 401 });
    }

    const rowData = result.rows[0] as any[];
    const userId = rowData[0];
    const userEmail = rowData[1];
    const storedHash = String(rowData[2] || '').trim().toLowerCase(); // jangan di slice
    const salt = String(rowData[3] || '').trim(); // <-- AMBIL SALT DARI DB
    const userName = rowData[4];
    const userRole = rowData[5];

    // 2. HASH PAKE SALT DARI DB
    const inputHash = hashPassword(cleanPassword, salt).toLowerCase();

    if (inputHash!== storedHash) {
      return NextResponse.json({ message: 'Password yang dimasukkan salah' }, { status: 401 });
    }

    //... sisa kode session kamu sama
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await connection.execute(
      `INSERT INTO app_user_sessions (id, user_id, session_token, expires_at)
       VALUES (SYS_GUID(), :userId, :sessionToken, :expiresAt)`,
      [userId, sessionToken, expiresAt],
      { autoCommit: true }
    );

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
    return NextResponse.json({ message: 'Terjadi kesalahan pada server' }, { status: 500 });
  } finally {
    if (connection) await connection.close();
  }
}
