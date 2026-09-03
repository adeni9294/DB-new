export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createTransaction } from '@/lib/oracle/repositories/transactionRepository';
import { executeQuery } from '@/lib/oracle/pool';

// Helper untuk mengekstrak teks asli jika nilainya berbentuk Objek dari Oracle
function parseStringValue(val: any): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    // Jika Oracle mengembalikan object { val: 'text' } atau sejenisnya
    if (val.val !== undefined) return String(val.val);
    if (val.value !== undefined) return String(val.value);
    if (val.text !== undefined) return String(val.text);
    return JSON.stringify(val);
  }
  return String(val);
}

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
    
    let rawRows: any[] = [];
    if (result && Array.isArray(result.rows)) {
      rawRows = result.rows;
    } else if (Array.isArray(result)) {
      rawRows = result;
    }

    const formattedData = rawRows.map((row: any) => {
      const rawId = row.ID ?? row.id ?? row[0];
      const rawNotes = row.NOTES ?? row.notes ?? row[1];
      const rawAmount = row.AMOUNT ?? row.amount ?? row[2];
      const rawType = row.TYPE ?? row.type ?? row[3];
      const rawDate = row.TRX_DATE ?? row.trx_date ?? row[4];

      const notesText = parseStringValue(rawNotes);

      return {
        id: parseStringValue(rawId),
        notes: notesText,
        title: notesText || 'Transaksi',
        amount: Number(parseStringValue(rawAmount)) || 0,
        type: parseStringValue(rawType).toLowerCase() || 'income',
        category: 'Umum',
        date: parseStringValue(rawDate)
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
      notes: String(transactionNotes),
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
