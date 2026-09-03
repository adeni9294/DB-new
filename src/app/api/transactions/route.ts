export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createTransaction } from '@/lib/oracle/repositories/transactionRepository';
import { executeQuery } from '@/lib/oracle/pool';

export async function GET() {
  try {
    // Sesuaikan kolom SELECT dengan struktur tabel database: id, notes (sebagai pengganti title), amount, type, category, transaction_date
    const sql = `SELECT id, notes, amount, type, category, transaction_date as date FROM transactions ORDER BY transaction_date DESC`;
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

    // Validasi - support field names dari frontend, ubah penangkapan title menjadi notes/title
    const { title, notes, amount, type, category, date, accountId } = body;
    const transactionNotes = title || notes;

    if (!amount || !type) {
      return NextResponse.json(
        { error: 'Field amount dan type transaksi wajib diisi.' },
        { status: 400 }
      );
    }

    if (!transactionNotes) {
      return NextResponse.json(
        { error: 'Field title/keterangan wajib diisi.' },
        { status: 400 }
      );
    }

    const mockUserId = 'USER-001';

    // Panggil createTransaction dengan payload menggunakan 'notes' sesuai kolom database
    const trxId = await createTransaction({
      notes: transactionNotes,
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
