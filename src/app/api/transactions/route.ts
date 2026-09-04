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

// Helper untuk memastikan format tanggal selalu YYYY-MM-DD aman untuk Oracle TO_DATE
function parseToIsoDate(dateStr: any): string {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  
  const str = String(dateStr).trim();

  // Jika format DD/MM/YYYY
  if (str.includes('/')) {
    const parts = str.split('/');
    if (parts.length === 3) {
      const [p1, p2, p3] = parts;
      if (p3.length === 4) {
        // DD/MM/YYYY -> YYYY-MM-DD
        return `${p3}-${p2.padStart(2, '0')}-${p1.padStart(2, '0')}`;
      }
    }
  }

  // Jika berupa timestamp / ISO String / YYYY-MM-DD
  const parsedDate = new Date(str);
  if (!isNaN(parsedDate.getTime())) {
    return parsedDate.toISOString().split('T')[0];
  }

  return new Date().toISOString().split('T')[0];
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

    const formattedDate = parseToIsoDate(date);
    const mockUserId = 'USER-001';

    const trxId = await createTransaction({
      notes: transactionNotes,
      amount: parseFloat(String(amount)),
      type: dbType,
      category: category || 'Umum',
      date: formattedDate,
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

    if (!idParam) {
      return NextResponse.json(
        { error: 'ID transaksi wajib diisi' },
        { status: 400 }
      );
    }

    const cleanId = String(idParam).replace(/\D/g, '');
    const numericId = parseInt(cleanId, 10);

    if (isNaN(numericId)) {
      return NextResponse.json(
        { error: 'ID transaksi harus berupa angka valid' },
        { status: 400 }
      );
    }

    const result = await executeQuery(
      `DELETE FROM transactions WHERE id = :id`,
      { id: numericId }
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
    const { id, title, notes, amount, type, date, transaction_date, tanggal } = body;

    // 1. Ekstrak & bersihkan ID agar murni berupa angka (NUMBER)
    const cleanId = String(id || '').replace(/\D/g, '');
    const numericId = parseInt(cleanId, 10);

    if (!cleanId || isNaN(numericId)) {
      return NextResponse.json(
        { error: 'ID transaksi tidak valid untuk pembaharuan data' },
        { status: 400 }
      );
    }

    // 2. Pastikan amount berupa angka (NUMBER) tanpa karakter non-numeric
    const rawAmountStr = String(amount || '').replace(/[^0-9.]/g, '');
    const numericAmount = Number(rawAmountStr);

    if (isNaN(numericAmount) || rawAmountStr === '') {
      return NextResponse.json(
        { error: 'Jumlah (amount) harus berupa angka valid' },
        { status: 400 }
      );
    }

    // 3. Normalize type
    const rawType = String(type || '').trim().toLowerCase();
    const dbType = (rawType === 'pengeluaran' || rawType === 'expense' || rawType === 'out') 
      ? 'out' 
      : 'in';

    const transactionNotes = String(title || notes || 'Transaksi').substring(0, 200);

    // 4. Konversi tanggal dari berbagai alternatif field frontend
    const rawDate = date || transaction_date || tanggal;
    const formattedDate = parseToIsoDate(rawDate);

    // Query UPDATE dengan binding terstruktur
    const sql = `
      UPDATE transactions 
      SET notes = :notes, 
          amount = :amount, 
          type = :type, 
          transaction_date = TO_DATE(:trx_date, 'YYYY-MM-DD') 
      WHERE id = :id
    `;

    const bindParams = {
      notes: transactionNotes,
      amount: numericAmount,
      type: dbType,
      trx_date: formattedDate,
      id: numericId
    };

    const result = await executeQuery(sql, bindParams);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('❌ PUT /api/transactions error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal memperbarui data', details: error?.stack },
      { status: 500 }
    );
  }
}
