export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { updateTransaction, deleteTransaction, getTransactions } from '@/lib/oracle/repositories/transactionRepository';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const transactions = await getTransactions({ limit, offset });
    return NextResponse.json({ success: true, data: transactions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, amount, type, category, transaction_date } = body;

    // Pastikan ID dan Amount dikonversi secara eksplisit ke Number untuk mencegah ORA-01722
    const numericId = Number(id);
    const numericAmount = Number(amount);

    if (isNaN(numericId)) {
      return NextResponse.json({ success: false, error: 'ID Transaksi harus berupa angka valid.' }, { status: 400 });
    }

    if (isNaN(numericAmount)) {
      return NextResponse.json({ success: false, error: 'Jumlah (Amount) harus berupa angka valid.' }, { status: 400 });
    }

    const updated = await updateTransaction({
      id: numericId,
      title: title || '',
      amount: numericAmount,
      type: type || 'PEMASUKAN',
      category: category || 'Umum',
      transactionDate: transaction_date ? new Date(transaction_date) : new Date()
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating transaction:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get('id');

    if (!idParam) {
      return NextResponse.json({ success: false, error: 'ID wajib diisi' }, { status: 400 });
    }

    const numericId = Number(idParam);
    if (isNaN(numericId)) {
      return NextResponse.json({ success: false, error: 'ID Transaksi tidak valid.' }, { status: 400 });
    }

    await deleteTransaction(numericId);
    return NextResponse.json({ success: true, message: 'Transaksi berhasil dihapus' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
