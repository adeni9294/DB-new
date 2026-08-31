import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getPool } from '@/lib/oracle/pool';

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha512').toString('hex'); // 100000 iterasi, 32 bytes = 128 hex
}

export async function POST(request: Request) {
  let connection;
  try {
    const { email, password, fullName } = await request.json();

    if (!email ||!password ||!fullName) {
      return NextResponse.json(
        { message: 'Nama lengkap, email, dan password wajib diisi' },
        { status: 400 }
      );
    }

    const pool = await getPool();
    connection = await pool.getConnection();

    const cleanEmail = email.toLowerCase().trim();

    // Cek user
    const checkUser = await connection.execute(
      `SELECT id FROM app_users WHERE LOWER(TRIM(email)) = :email`,
      [cleanEmail],
      { outFormat: 4002 } // OUT_FORMAT_OBJECT
    );

    if (checkUser.rows && checkUser.rows.length > 0) {
      await connection.close();
      return NextResponse.json({ message: 'Email sudah terdaftar' }, { status: 409 });
    }

    // Generate Salt & Hash
    const salt = crypto.randomBytes(16).toString('hex'); // 16 bytes = 32 hex
    const passwordHash = hashPassword(password, salt);

    // Insert user baru
    await connection.execute(
      `INSERT INTO app_users (id, email, password_hash, salt, name, full_name, role, created_at)
       VALUES (SYS_GUID(), :email, :passwordHash, :salt, :fullName, :fullName, 'user', SYSDATE)`,
      {
        email: cleanEmail, 
        passwordHash, 
        salt, 
        fullName
      },
      { autoCommit: true }
    );

    await connection.close();
    return NextResponse.json(
      { message: 'Registrasi berhasil! Silakan login.' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Register error:', error);
    if (connection) await connection.close();
    return NextResponse.json(
      { message: error.message || 'Gagal mendaftar pengguna baru' },
      { status: 500 }
    );
  }
}
