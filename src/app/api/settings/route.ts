import { NextRequest, NextResponse } from "next/server";
import { updateProfile } from "@/lib/oracle/repositories/userRepository"; // sesuaikan jalur repository Anda

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, role } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email tidak ditemukan" },
        { status: 400 }
      );
    }

    // Eksekusi fungsi update ke DB Oracle
    const updatedUser = await updateProfile({ name, email, role });

    return NextResponse.json({
      success: true,
      message: "Profil berhasil diperbarui",
      data: updatedUser,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Gagal memperbarui profil di database",
      },
      { status: 500 }
    );
  }
}
