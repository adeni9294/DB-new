export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createTransaction } from '@/lib/oracle/repositories/transactionRepository';
import { executeQuery } from '@/lib/oracle/pool';

export async function GET() {
  try {
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
    
    // Ekstrak baris data secara aman dari objek/array Oracle
    let rawRows: any[] = [];
    if (result && Array.isArray(result.rows)) {
      rawRows = result.rows;
    } else if (Array.isArray(result)) {
      rawRows = result;
    }

    // Ubah data ke objek JavaScript polos (bebas circular reference)
    const formattedData = rawRows.map((row: any) => {
      const id = row.ID ?? row.id ?? row[0] ?? '';
      const notes = row.NOTES ?? row.notes ?? row[1] ?? '';
      const amount = Number(row.AMOUNT ?? row.amount ?? row[2] ?? 0);
      const rawType = (row.TYPE ?? row.type ?? row[3] ?? 'INCOME').toString();
      const date = row.TRX_DATE ?? row.trx_date ?? row[4] ?? '';

      return {
        id: String(id),
        notes: String(notes),
        title: String(notes) || 'Transaksi',
        amount: isNaN(amount) ? 0 : amount,
        type: rawType.toLowerCase(),
        category: 'Umum',
        date: String(date)
      };
    });

    return NextResponse.json(formattedData);
  } catch (error: any) {
    console.error('❌ GET /api/transactions error:', error?.message);
    return NextResponse.json(
      { error: 'Gagal mengambil data transaksi dari Oracle DB', details: error?.message || 'Unknown error' }, 
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
    console.error('❌ POST /api/transactions error:', error?.message);
    return NextResponse.json(
      { 
        error: 'Gagal menyimpan transaksi ke Oracle DB', 
        details: error?.message || 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}
