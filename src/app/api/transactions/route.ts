export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createTransaction } from '@/lib/oracle/repositories/transactionRepository';
import { executeQuery } from '@/lib/oracle/pool';

export async function GET() {
  try {
    // 1. Mengubah alias "date" menjadi "trx_date" untuk menghindari Oracle Reserved Keyword (ORA-00923)
    // 2. Menghapus kolom 'category' dari SQL jika tidak ada di tabel transactions
    const sql = `
      SELECT 
        id, 
        notes, 
        amount, 
        type, 
        TO_CHAR(transaction_date, 'YYYY-MM-DD') AS trx_date 
      FROM transactions 
      ORDER BY transaction_date DESC, id DESC
    `;
    
    const result: any = await executeQuery(sql);
    const rawRows = result?.rows || (Array.isArray(result) ? result : []);

    // Format properti objek agar seragam dan aman dikonsumsi Frontend Next.js
    const formattedData = rawRows.map((row: any) => ({
      id: row.ID ?? row.id ?? row[0],
      notes: row.NOTES ?? row.notes ?? row[1] ?? '',
      title: row.NOTES ?? row.notes ?? row[1] ?? 'Transaksi',
      amount: Number(row.AMOUNT ?? row.amount ?? row[2] ?? 0),
      type: (row.TYPE ?? row.type ?? row[3] ?? 'INCOME').toString().toLowerCase(),
      category: 'Umum',
      date: row.TRX_DATE ?? row.trx_date ?? row[4] ?? ''
    }));

    return NextResponse.json(formattedData);
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

    const trxId = await createTransaction({
      notes: transactionNotes,
      amount: parseFloat(String(amount)),
      type: String(type),
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
