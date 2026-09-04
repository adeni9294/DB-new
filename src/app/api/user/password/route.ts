import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "Kata sandi tidak boleh kosong" },
        { status: 400 }
      );
    }

    // Eksekusi logic ubah kata sandi di Oracle DB di sini jika diperlukan

    return NextResponse.json({
      success: true,
      message: "Kata sandi berhasil diubah",
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Gagal mengubah kata sandi" },
      { status: 500 }
    );
  }
}
