import { NextRequest, NextResponse } from "next/server";
import { updateProfile } from "@/lib/oracle/repositories/authRepository";
import { executeQuery } from "@/lib/oracle/db"; // sesuaikan path helper db kamu

// GET Profile dari Oracle DB
export async function GET() {
  try {
    // Ambil data user berdasarkan email yang sedang aktif/login
    const sql = `SELECT email, full_name, role FROM users WHERE email = :email`;
    const result = await executeQuery(sql, { email: "adeni9294@gmail.com" });

    const user = result.rows?.[0];

    return NextResponse.json({
      name: user?.FULL_NAME || user?.full_name || "",
      email: user?.EMAIL || user?.email || "",
      role: user?.ROLE || user?.role || "Administrator",
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Gagal memuat profil" },
      { status: 500 }
    );
  }
}

// PUT Update Profile
export async function PUT(req: NextRequest) {
  try {
    const { name, email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email wajib diisi" },
        { status: 400 }
      );
    }

    await updateProfile({ name, email });

    return NextResponse.json({
      success: true,
      message: "Profil berhasil diperbarui",
    });
  } catch (error: any) {
    console.error("❌ Error Update Profile:", error);
    return NextResponse.json(
      { message: error?.message || "Gagal memperbarui profil" },
      { status: 500 }
    );
  }
}
