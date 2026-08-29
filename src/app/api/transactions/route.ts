import { NextResponse } from 'next/server';
import { createTransaction } from '@/lib/oracle/repositories/transactionRepository';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validasi input sederhana
    if (!body.amount || !body.accountId || !body.type) {
      return NextResponse.json(
        { error: 'Field nominal, akun, dan tipe transaksi wajib diisi.' },
        { status: 400 }
      );
    }

    // Simulasi UserId dari session
    const mockUserId = 'USER-001';

    const trxId = await createTransaction({
      ...body,
      userId: mockUserId,
    });

    return NextResponse.json(
      { success: true, transactionId: trxId, message: 'Transaksi berhasil disimpan.' },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
