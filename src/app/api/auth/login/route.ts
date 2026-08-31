export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import oracledb from 'oracledb';
import crypto from 'crypto';
import fs from 'fs';
import AdmZip from 'adm-zip';

let walletInitialized = false;

async function initWallet() {
  if (walletInitialized) return;
  
  const walletPath = '/tmp/wallet';
  if (!fs.existsSync(walletPath)) {
    fs.mkdirSync(walletPath, { recursive: true });
    
    if (!process.env.WALLET_ZIP_BASE64) {
      throw new Error("WALLET_ZIP_BASE64 environment variable not set");
    }

    const walletZipBuffer = Buffer.from(process.env.WALLET_ZIP_BASE64, 'base64');
    const zip = new AdmZip(walletZipBuffer);
    zip.extractAllTo(walletPath, true); // extract ke /tmp/wallet
  }
  
  // kasih tau oracle dimana wallet nya
  oracledb.configDir = walletPath; 
  oracledb.initOracleClient({ libDir: walletPath });
  walletInitialized = true;
}

export async function POST(request: Request) {
  let connection;
  try {
    await initWallet(); // WAJIB JALANIN INI DULU

    const { email, password } = await request.json();

    if (!email ||!password) {
      return NextResponse.json({ success: false, message: 'Email dan password wajib diisi' }, { status: 400 });
    }

    // konek pake alias dari tnsnames.ora di dalam wallet
    connection = await oracledb.getConnection({
      user: process.env.DB_USER, // ADMIN
      password: process.env.DB_PASSWORD,
      connectString: "dbhaulnew_high" // <-- PENTING: pake _high
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

    // cek password pake pbkdf2
    const hash = crypto.pbkdf2Sync(password, user.SALT, 1000, 32, 'sha512').toString('hex');
    if (hash!== user.PASSWORD_HASH) {
      return NextResponse.json({ success: false, message: 'Password salah' }, { status: 401 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Login berhasil", 
      user: { id: user.ID, email: user.EMAIL, fullName: user.FULL_NAME } 
    });

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
