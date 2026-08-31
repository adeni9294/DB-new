import { NextResponse } from 'next/server';
import oracledb from 'oracledb';
import crypto from 'crypto';

// WAJIB: thin mode biar jalan di Vercel tanpa Oracle Client
oracledb.initOracleClient({ libDir: undefined }); 

export async function POST(request: Request) {
  let connection;
  try {
    const { email, password } = await request.json();

    if (!email ||!password) {
      return NextResponse.json({ success: false, message: 'Email dan Password wajib diisi' }, { status: 400 });
    }

    // 1. Koneksi langsung, jangan pake pool
    connection = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING
    });

    // 2. Query pake OUT_FORMAT_OBJECT biar enak
    const result = await connection.execute(
      `SELECT ID, EMAIL, PASSWORD_HASH, SALT, FULL_NAME FROM app_users WHERE EMAIL = :email`,
      [email],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const user = result.rows?.[0] as any;

    if (!user) {
      return NextResponse.json({ success: false, message: 'Email tidak ditemukan' }, { status: 401 });
    }

    // 3. Cek password
    const hash = crypto.pbkdf2Sync(password, user.SALT, 1000, 32, 'sha512').toString('hex');

    if (hash!== user.PASSWORD_HASH) {
      return NextResponse.json({ success: false, message: 'Password salah' }, { status: 401 });
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
    return NextResponse.json({ success: false, message: `Terjadi kesalahan server: ${error.message}` }, { status: 500 });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}
