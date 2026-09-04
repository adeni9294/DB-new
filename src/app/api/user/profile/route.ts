import { NextRequest, NextResponse } from "next/server";
import { updateProfile } from "@/lib/oracle/repositories/authRepository";

export async function GET() {
  try {
    return NextResponse.json({
      name: "Ahmad Deni",
      email: "adeni9294@gmail.com",
      role: "Administrator",
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Gagal mengambil data profil" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json(
        { message: "Nama dan email tidak boleh kosong" },
        { status: 400 }
      );
    }

    const result = await updateProfile({ name, email });

    return NextResponse.json({
      success: true,
      message: "Profil berhasil diperbarui",
      data: result,
    });
  } catch (error: any) {
    console.error("❌ Error Update Profile:", error);
    return NextResponse.json(
      { message: error?.message || "Terjadi kesalahan pada database Oracle" },
      { status: 500 }
    );
  }
}
