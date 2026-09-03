export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createTransaction } from '@/lib/oracle/repositories/transactionRepository';
import { executeQuery } from '@/lib/oracle/pool';

export async function GET() {
  try {
    const sql = `SELECT id, title, amount, type, category, date FROM transactions ORDER BY date DESC`;
    const result: any = await executeQuery(sql);
    
    // Transform result to array format untuk frontend
    if (result?.rows && Array.isArray(result.rows)) {
      return NextResponse.json(result.rows);
    }
    
    return NextResponse.json(result || []);
  } catch (error: any) {
    console.error('❌ GET /api/transactions error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data transaksi dari Oracle DB', details: error.message }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validasi - support field names dari frontend (title, amount, type, category, date)
    const { title, amount, type, category, date, accountId } = body;

    if (!amount || !type) {
      return NextResponse.json(
        { error: 'Field amount dan type transaksi wajib diisi.' },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { error: 'Field title/keterangan wajib diisi.' },
        { status: 400 }
      );
    }

    const mockUserId = 'USER-001';

    // Panggil createTransaction dengan payload yang sudah divalidasi
    const trxId = await createTransaction({
      title,
      amount: parseFloat(String(amount)),
      type: String(type).toLowerCase(), // normalize: 'pemasukan' atau 'pengeluaran'
      category: category || 'Umum',
      date: date || new Date().toISOString().split('T')[0],
      userId: mockUserId,
      accountId: accountId || 'DEFAULT_ACCOUNT'
    });

    return NextResponse.json(
      { 
        success: true, 
        transactionId: trxId, 
        message: 'Transaksi berhasil disimpan ke Oracle DB.' 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('❌ POST /api/transactions error:', error);
    return NextResponse.json(
      { 
        error: 'Gagal menyimpan transaksi ke Oracle DB', 
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}
