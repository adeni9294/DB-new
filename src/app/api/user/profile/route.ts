import { NextRequest, NextResponse } from "next/server";
import { updateProfile } from "@/lib/oracle/repositories/authRepository";
import { executeQuery } from "@/lib/oracle/pool";

export async function GET() {
  try {
    const sql = `SELECT email, full_name, role FROM users WHERE email = :email`;
    const result = (await executeQuery(sql, { email: "adeni9294@gmail.com" })) as any[];

    const user = result?.[0];

    return NextResponse.json({
      name: user?.FULL_NAME || user?.full_name || "",
      email: user?.EMAIL || user?.email || "",
      role: user?.ROLE || user?.role || "Administrator",
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Gagal memuat profil dari Oracle" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email } = body;

    if (!email || !name) {
      return NextResponse.json(
        { message: "Nama dan Email tidak boleh kosong" },
        { status: 400 }
      );
    }

    await updateProfile({ name, email });

    return NextResponse.json({
      success: true,
      message: "Profil berhasil diperbarui ke Oracle Database!",
    });
  } catch (error: any) {
    console.error("❌ Error Update Profile:", error);
    return NextResponse.json(
      { message: error?.message || "Gagal memperbarui profil di Oracle Database" },
      { status: 500 }
    );
  }
}
