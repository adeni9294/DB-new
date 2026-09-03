export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createTransaction } from '@/lib/oracle/repositories/transactionRepository';
import { executeQuery } from '@/lib/oracle/pool';

async function extractString(val: any): Promise<string> {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);

  if (typeof val === 'object' && typeof val.read === 'function') {
    return new Promise((resolve) => {
      let data = '';
      val.setEncoding('utf8');
      val.on('data', (chunk: string) => { data += chunk; });
      val.on('end', () => resolve(data));
      val.on('error', () => resolve(''));
    });
  }

  if (typeof val === 'object') {
    if (val.val !== undefined) return extractString(val.val);
    if (val.value !== undefined) return extractString(val.value);
    if (val.text !== undefined) return extractString(val.text);
    if (Buffer.isBuffer(val)) return val.toString('utf-8');
  }

  return String(val);
}

// --- GET: AMBIL DAFTAR TRANSAKSI ---
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

        const cleanIdStr = idText.replace(/\D/g, '');
        const parsedId = parseInt(cleanIdStr, 10);
        const finalId = isNaN(parsedId) ? idText : parsedId;

        if (!notesText || notesText.trim() === '[object Object]') {
          notesText = 'Transaksi';
        }

        const cleanType = typeText.toLowerCase();
        const displayType = (cleanType === 'out' || cleanType === 'expense' || cleanType === 'pengeluaran') 
          ? 'pengeluaran' 
          : 'pemasukan';

        return {
          id: finalId,
          notes: notesText,
          title: notesText,
          amount: Number(amountText) || 0,
          type: displayType,
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

// --- POST: TAMBAH TRANSAKSI BARU ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, notes, amount, type, category, date, accountId } = body;
    
    let transactionNotes = title || notes;
    if (typeof transactionNotes === 'object') {
      transactionNotes = JSON.stringify(transactionNotes);
    }
    transactionNotes = String(transactionNotes || 'Transaksi').substring(0, 200);

    if (!amount || !type) {
      return NextResponse.json(
        { error: 'Field amount dan type transaksi wajib diisi.' },
        { status: 400 }
      );
    }

    const rawType = String(type).trim().toLowerCase();
    const dbType = (rawType === 'pengeluaran' || rawType === 'expense' || rawType === 'out') 
      ? 'out' 
      : 'in';

    const mockUserId = 'USER-001';

    const trxId = await createTransaction({
      notes: transactionNotes,
      amount: parseFloat(String(amount)),
      type: dbType,
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
        error: error?.message || 'Gagal menyimpan transaksi ke Oracle DB', 
        details: error?.stack || 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}

// --- DELETE: HAPUS TRANSAKSI ---
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get('id');

    if (!idParam || isNaN(Number(idParam))) {
      return NextResponse.json(
        { error: 'ID transaksi tidak valid atau kosong' },
        { status: 400 }
      );
    }

    const transactionId = Number(idParam);

    const result = await executeQuery(
      `DELETE FROM transactions WHERE id = :id`,
      [transactionId]
    );

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('❌ DELETE /api/transactions error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal menghapus data' },
      { status: 500 }
    );
  }
}

// --- PUT: EDIT TRANSAKSI ---
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, notes, amount, type, date } = body;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: 'ID transaksi tidak valid untuk pembaharuan data' },
        { status: 400 }
      );
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) {
      return NextResponse.json(
        { error: 'Jumlah (amount) harus berupa angka valid' },
        { status: 400 }
      );
    }

    const rawType = String(type || '').trim().toLowerCase();
    const dbType = (rawType === 'pengeluaran' || rawType === 'expense' || rawType === 'out') 
      ? 'out' 
      : 'in';

    const transactionNotes = String(title || notes || 'Transaksi').substring(0, 200);

    const result = await executeQuery(
      `UPDATE transactions 
       SET notes = :notes, 
           amount = :amount, 
           type = :type, 
           transaction_date = TO_DATE(:trx_date, 'YYYY-MM-DD') 
       WHERE id = :id`,
      {
        notes: transactionNotes,
        amount: numericAmount,
        type: dbType,
        trx_date: date || new Date().toISOString().split('T')[0],
        id: Number(id)
      }
    );

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('❌ PUT /api/transactions error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal memperbarui data' },
      { status: 500 }
    );
  }
}
