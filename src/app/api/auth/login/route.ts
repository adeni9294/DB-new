import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { executeQuery } from '@/lib/oracle/pool'; // <-- pake ini

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 32, 'sha512').toString('hex');
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email ||!password) {
      return NextResponse.json({ message: 'Email dan password wajib diisi' }, { status: 400 });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password).trim();

    // 1. SELECT PAKE executeQuery -> hasilnya object
    const users = await executeQuery(
      `SELECT id, email, password_hash, salt, full_name, role 
       FROM app_users 
       WHERE LOWER(TRIM(email)) = :email`,
      { email: cleanEmail }
    ) as any[];

    if (users.length === 0) {
      return NextResponse.json({ message: 'Email tidak terdaftar' }, { status: 401 });
    }

    const user = users[0];
    const storedHash = String(user.password_hash || '').trim().toLowerCase();
    const salt = String(user.salt || '').trim();

    // 2. HASH PAKE SALT DARI DB
    const inputHash = hashPassword(cleanPassword, salt).toLowerCase();

    if (inputHash!== storedHash) {
      return NextResponse.json({ message: 'Password yang dimasukkan salah' }, { status: 401 });
    }

    // 3. INSERT SESSION
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await executeQuery(
      `INSERT INTO app_user_sessions (id, user_id, session_token, expires_at)
       VALUES (SYS_GUID(), :userId, :sessionToken, :expiresAt)`,
      { userId: user.id, sessionToken, expiresAt }
    );

    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil',
      user: { id: user.id, email: user.email, name: user.full_name, role: user.role },
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
    return NextResponse.json({ message: error.message }, { status: 500 }); // biar keliatan error asli
  }
}
