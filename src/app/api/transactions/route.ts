export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createTransaction } from '@/lib/oracle/repositories/transactionRepository';
import { executeQuery } from '@/lib/oracle/pool';

// Helper khusus untuk mengekstrak string murni dari berbagai tipe data Oracle (Object, CLOB, Buffer, dsb)
function toCleanString(val: any): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  
  // Jika Oracle mengembalikan Objek Wrapper (CLOB / Column Object)
  if (typeof val === 'object') {
    if (val.val !== undefined) return toCleanString(val.val);
    if (val.value !== undefined) return toCleanString(val.value);
    if (val.text !== undefined) return toCleanString(val.text);
    if (Buffer.isBuffer(val)) return val.toString('utf-8');
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
    
    const rawRows = result?.rows || (Array.isArray(result) ? result : []);

    const formattedData = rawRows.map((row: any) => {
      let rawId, rawNotes, rawAmount, rawType, rawDate;

      if (Array.isArray(row)) {
        // Jika format query berupa ARRAY [id, notes, amount, type, trx_date]
        [rawId, rawNotes, rawAmount, rawType, rawDate] = row;
      } else if (row && typeof row === 'object') {
        // Jika format query berupa OBJECT { ID, NOTES, ... }
        rawId = row.ID ?? row.id;
        rawNotes = row.NOTES ?? row.notes;
        rawAmount = row.AMOUNT ?? row.amount;
        rawType = row.TYPE ?? row.type;
        rawDate = row.TRX_DATE ?? row.trx_date;
      }

      const notesText = toCleanString(rawNotes);

      return {
        id: toCleanString(rawId),
        notes: notesText,
        title: notesText || 'Transaksi',
        amount: Number(toCleanString(rawAmount)) || 0,
        type: toCleanString(rawType).toLowerCase() || 'pemasukan',
        category: 'Umum',
        date: toCleanString(rawDate)
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
