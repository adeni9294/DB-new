import { NextRequest, NextResponse } from "next/server";
import {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "@/lib/oracle/repositories/eventRepository";

export async function GET() {
  try {
    const events = await getAllEvents();
    return NextResponse.json({ success: true, data: events });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal mengambil data dari Oracle DB" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, startDate, endDate, location } = body;

    if (!title || !startDate || !location) {
      return NextResponse.json(
        { success: false, message: "Title, Start Date, dan Location wajib diisi" },
        { status: 400 }
      );
    }

    const newEvent = await createEvent({ title, startDate, endDate, location });
    return NextResponse.json({ success: true, data: newEvent }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal menyimpan ke Oracle DB" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, startDate, endDate, location } = body;

    if (!id || !title || !startDate || !location) {
      return NextResponse.json(
        { success: false, message: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    const updated = await updateEvent(id, { title, startDate, endDate, location });
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal memperbarui di Oracle DB" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID acara diperlukan" },
        { status: 400 }
      );
    }

    await deleteEvent(id);
    return NextResponse.json({ success: true, message: "Acara berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal menghapus dari Oracle DB" },
      { status: 500 }
    );
  }
}
