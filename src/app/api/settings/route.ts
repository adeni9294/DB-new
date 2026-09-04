import { NextRequest, NextResponse } from "next/server";
import { updateProfile } from "@/lib/oracle/repositories/authRepository";

// GET Profile
export async function GET() {
  try {
    // Sesuaikan nilai balik ini dari session / Oracle DB jika ada
    return NextResponse.json({
      name: "Ahmad Deni",
      email: "adeni9294@gmail.com",
      role: "Administrator",
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
    return NextResponse.json(
      { message: error?.message || "Gagal memperbarui profil" },
      { status: 500 }
    );
  }
}
