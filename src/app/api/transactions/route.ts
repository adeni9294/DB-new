export const dynamic = 'force-dynamic'; // Tambahin ini juga

import { NextResponse } from 'next/server';
import { createTransaction } from '@/lib/oracle/repositories/transactionRepository';
import { executeQuery } from '@/lib/oracle/pool'; // buat GET

export async function GET() {
  try {
    const sql = `SELECT * FROM transactions ORDER BY created_at DESC`;
    const result = await executeQuery(sql);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.amount || !body.accountId || !body.type) {
      return NextResponse.json(
        { error: 'Field nominal, akun, dan tipe transaksi wajib diisi.' },
        { status: 400 }
      );
    }

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
