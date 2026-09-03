export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createTransaction } from '@/lib/oracle/repositories/transactionRepository';
import { executeQuery } from '@/lib/oracle/pool';

// Helper Async untuk membaca data jika kolom bertipe Lob (CLOB) atau objek bertingkat
async function extractString(val: any): Promise<string> {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);

  // Jika Oracle mengembalikan Stream Lob / CLOB
  if (typeof val === 'object' && typeof val.read === 'function') {
    return new Promise((resolve) => {
      let data = '';
      val.setEncoding('utf8');
      val.on('data', (chunk: string) => { data += chunk; });
      val.on('end', () => resolve(data));
      val.on('error', () => resolve(''));
    });
  }

  // Jika berupa object wrapper Oracle
  if (typeof val === 'object') {
    if (val.val !== undefined) return extractString(val.val);
    if (val.value !== undefined) return extractString(val.value);
    if (val.text !== undefined) return extractString(val.text);
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

    const formattedData = await Promise.all(
      rawRows.map(async (row: any) => {
        let rawId, rawNotes, rawAmount, rawType, rawDate;

        if (Array.isArray(row)) {
          [rawId, rawNotes, rawAmount, rawType, rawDate] = row;
        } else if (row && typeof row === 'object') {
          rawId = row.ID ?? row.id;
          rawNotes = row.NOTES ?? row.notes;
          rawAmount = row.AMOUNT ?? row.amount;
          rawType = row.TYPE ?? row.type;
          rawDate = row.TRX_DATE ?? row.trx_date;
        }

        let notesText = await extractString(rawNotes);
        const idText = await extractString(rawId);
        const amountText = await extractString(rawAmount);
        const typeText = await extractString(rawType);
        const dateText = await extractString(rawDate);

        // Jika data di database memang terlanjur tersimpan tulisan "[object Object]"
        if (!notesText || notesText.trim() === '[object Object]') {
          notesText = 'Transaksi Pemasukan';
        }

        return {
          id: idText,
          notes: notesText,
          title: notesText,
          amount: Number(amountText) || 0,
          type: typeText.toLowerCase() || 'pemasukan',
          category: 'Umum',
          date: dateText
        };
      })
    );

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
    
    // Pastikan nilai notes murni berupa string primitif
    let transactionNotes = title || notes;
    if (typeof transactionNotes === 'object') {
      transactionNotes = JSON.stringify(transactionNotes);
    }
    transactionNotes = String(transactionNotes || 'Transaksi');

    if (!amount || !type) {
      return NextResponse.json(
        { error: 'Field amount dan type transaksi wajib diisi.' },
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
