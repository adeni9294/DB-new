import { NextRequest, NextResponse } from "next/server";
import { updateProfile } from "@/lib/oracle/repositories/authRepository";

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email wajib diisi" },
        { status: 400 }
      );
    }

    const updated = await updateProfile({ name, email });
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal memperbarui profil" },
      { status: 500 }
    );
  }
}
