export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import oracledb from 'oracledb';
import crypto from 'crypto';

export async function POST(request: Request) {
  let connection;
  try {
    const { email, password } = await request.json();

    if (!email ||!password) {
      return NextResponse.json({ success: false, message: 'Email dan password wajib diisi' }, { status: 400 });
    }

    // STRING KONEKSI LANGSUNG DARI tnsnames.ora KAMU
    const connectString = `(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.ap-batam-1.oraclecloud.com))(connect_data=(service_name=gfc40edfb77a0d0_dbhaulnew_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))`

    connection = await oracledb.getConnection({
      user: process.env.DB_USER, // ADMIN
      password: process.env.DB_PASSWORD,
      connectString: connectString
    });

    const result = await connection.execute(
      `SELECT ID, EMAIL, PASSWORD_HASH, SALT, FULL_NAME
       FROM ADMIN.APP_USERS
       WHERE EMAIL = :email`,
      [email],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const user = result.rows?.[0] as any;
    if (!user) {
      return NextResponse.json({ success: false, message: 'Email tidak ditemukan' }, { status: 401 });
    }

    // 100000 iterasi sama kayak register
    const hash = crypto.pbkdf2Sync(password, user.SALT, 100000, 32, 'sha512').toString('hex');
    if (hash!== user.PASSWORD_HASH) {
      return NextResponse.json({ success: false, message: 'Password salah' }, { status: 401 });
    }

    // RESPONSE + SET COOKIE BIAR GAK MENTAL
    const res = NextResponse.json({ 
      success: true, 
      message: "Login berhasil", 
      user: { id: user.ID, email: user.EMAIL, fullName: user.FULL_NAME } 
    });

    res.cookies.set('user', JSON.stringify({ id: user.ID, email: user.EMAIL, name: user.FULL_NAME }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 hari
    });

    return res;

  } catch (error: any) {
    console.error("DB ERROR:", error);
    return NextResponse.json({ success: false, message: `Terjadi kesalahan server: ${error.message}` }, { status: 500 });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}
