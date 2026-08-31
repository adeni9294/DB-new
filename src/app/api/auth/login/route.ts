export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import oracledb from 'oracledb';
import crypto from 'crypto';

// JANGAN PAKE initOracleClient. Kita pake Thin Mode

export async function POST(request: Request) {
  let connection;
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email ||!password) {
      return NextResponse.json({ 
        success: false, 
        message: 'Email dan Password wajib diisi' 
      }, { status: 400 });
    }

    // Validasi ENV
    if (!process.env.DB_USER ||!process.env.DB_PASSWORD ||!process.env.DB_CONNECT_STRING) {
      console.error("ENV Missing:", {
        user:!!process.env.DB_USER,
        pass:!!process.env.DB_PASSWORD,
        conn:!!process.env.DB_CONNECT_STRING
      })
      return NextResponse.json({ 
        success: false, 
        message: 'Konfigurasi DB belum lengkap di Vercel' 
      }, { status: 500 });
    }

    // 1. Koneksi langsung ke Oracle Cloud
    connection = await oracledb.getConnection({
      user: process.env.DB_USER, // ADMIN
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING // adb.ap-batam-1.oraclecloud.com:1521/..._high
    });

    // 2. Cari user di schema ADMIN
    const result = await connection.execute(
      `SELECT ID, EMAIL, PASSWORD_HASH, SALT, FULL_NAME 
       FROM ADMIN.APP_USERS 
       WHERE EMAIL = :email`,
      [email],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const user = result.rows?.[0] as any;

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'Email tidak ditemukan' 
      }, { status: 401 });
    }

    // 3. Cek password pake PBKDF2
    const hash = crypto.pbkdf2Sync(password, user.SALT, 1000, 32, 'sha512').toString('hex');

    if (hash!== user.PASSWORD_HASH) {
      return NextResponse.json({ 
        success: false, 
        message: 'Password salah' 
      }, { status: 401 });
    }

    // 4. Sukses
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
    console.error("DB ERROR:", error);
    return NextResponse.json({ 
      success: false, 
      message: `Terjadi kesalahan server: ${error.message}` 
    }, { status: 500 });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection", err);
      }
    }
  }
}
