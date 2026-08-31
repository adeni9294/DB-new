import { NextResponse } from 'next/server';
import oracledb from 'oracledb';
import crypto from 'crypto';

export async function POST(request: Request) {
  let connection;
  try {
    const { email, password } = await request.json();

    connection = await oracledb.getConnection();

    const result = await connection.execute(
      `SELECT ID, EMAIL, PASSWORD_HASH, SALT, FULL_NAME FROM app_users WHERE EMAIL = :email`,
      [email],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const user = result.rows?.[0] as any;

    if (!user) {
      return NextResponse.json({ success: false, message: 'Email tidak ditemukan' }, { status: 401 });
    }

    // Hash password input pake salt dari DB
    const hash = crypto.pbkdf2Sync(password, user.SALT, 1000, 32, 'sha512').toString('hex');

    if (hash!== user.PASSWORD_HASH) {
      return NextResponse.json({ success: false, message: 'Password salah' }, { status: 401 });
    }

    // SUKSES - balikin data user
    return NextResponse.json({
      success: true,
      message: "Login berhasil",
      user: {
        id: user.ID,
        email: user.EMAIL,
        fullName: user.FULL_NAME
      }
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server' }, { status: 500 });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}
