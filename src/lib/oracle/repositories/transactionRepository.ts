import { executeQuery } from '../pool';

export interface TransactionDTO {
  id?: number | string;
  amount: number;
  accountId?: string | number;
  type: string;
  category?: string;
  notes?: string;
  title?: string;
  description?: string;
  date?: string;
  transactionDate?: string;
  userId?: string | number;
  [key: string]: any;
}

// Helper untuk format tanggal aman YYYY-MM-DD
function normalizeDate(dateStr: any): string {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  const str = String(dateStr).trim();

  if (str.includes('/')) {
    const parts = str.split('/');
    if (parts.length === 3) {
      const [p1, p2, p3] = parts;
      if (p3.length === 4) {
        return `${p3}-${p2.padStart(2, '0')}-${p1.padStart(2, '0')}`;
      }
    }
  }

  const parsedDate = new Date(str);
  if (!isNaN(parsedDate.getTime())) {
    return parsedDate.toISOString().split('T')[0];
  }

  return new Date().toISOString().split('T')[0];
}

export async function createTransaction(payload: TransactionDTO) {
  try {
    const notesContent = String(payload.notes || payload.title || payload.description || 'Transaksi').substring(0, 200);
    const transactionDate = normalizeDate(payload.date || payload.transactionDate);

    // 1. Ambil / Buat ID angka unik untuk mencegah Mismatch ORA-01722 jika ID bertipe NUMBER
    let generatedId: number;
    try {
      const seqRes: any = await executeQuery(`SELECT NVL(MAX(id), 0) + 1 AS NEXT_ID FROM transactions`);
      const row = seqRes?.rows?.[0];
      const maxId = row ? (row.NEXT_ID ?? row.next_id ?? row[0]) : null;
      generatedId = maxId ? Number(maxId) : Date.now();
    } catch {
      generatedId = Date.now();
    }

    // 2. Ambil User ID yang valid dari tabel USERS
    let validUserId: any = payload.userId;
    if (!validUserId || validUserId === 'USER-001') {
      const userRes: any = await executeQuery(`SELECT id FROM users WHERE ROWNUM <= 1`);
      if (userRes?.rows?.[0]) {
        validUserId = userRes.rows[0].ID ?? userRes.rows[0].id ?? userRes.rows[0][0];
      } else {
        validUserId = 1;
      }
    }

    // 3. Ambil Account ID yang valid dari tabel ACCOUNTS
    let validAccountId: any = payload.accountId;
    if (!validAccountId || validAccountId === 'DEFAULT_ACCOUNT' || validAccountId === 'ACC-DEFAULT') {
      const accRes: any = await executeQuery(`SELECT id FROM accounts WHERE ROWNUM <= 1`);
      
      if (accRes?.rows?.[0]) {
        validAccountId = accRes.rows[0].ID ?? accRes.rows[0].id ?? accRes.rows[0][0];
      } else {
        const newAccId = Date.now(); 
        await executeQuery(
          `INSERT INTO accounts (id, name, type, balance, user_id) VALUES (:id, :name, :type, :balance, :userId)`,
          { id: newAccId, name: 'Kas Utama', type: 'CASH', balance: 0, userId: validUserId }
        );
        validAccountId = newAccId;
      }
    }

    // 4. Clean amount ke murni number
    const numericAmount = Number(String(payload.amount).replace(/[^0-9.]/g, '')) || 0;

    const sql = `
      INSERT INTO transactions (
        id,
        user_id, 
        account_id, 
        type, 
        amount, 
        notes, 
        transaction_date
      ) VALUES (
        :id,
        :userId, 
        :accountId, 
        :type, 
        :amount, 
        :notes, 
        TO_DATE(:transactionDate, 'YYYY-MM-DD')
      )
    `;

    const binds = {
      id: generatedId,
      userId: validUserId,
      accountId: validAccountId,
      type: payload.type || 'in',
      amount: numericAmount,
      notes: notesContent,
      transactionDate: transactionDate,
    };

    const result = await executeQuery(sql, binds);
    return generatedId;

  } catch (err: any) {
    console.error('❌ CRITICAL TRANSACTION ERROR:', err?.message);
    throw new Error(err?.message || 'Gagal menyimpan transaksi ke Oracle DB');
  }
}

export async function updateTransaction(payload: TransactionDTO) {
  try {
    const cleanId = String(payload.id || '').replace(/\D/g, '');
    const numericId = parseInt(cleanId, 10);

    if (!cleanId || isNaN(numericId)) {
      throw new Error('ID transaksi tidak valid untuk pembaharuan data');
    }

    const numericAmount = Number(String(payload.amount).replace(/[^0-9.]/g, '')) || 0;
    const notesContent = String(payload.notes || payload.title || payload.description || 'Transaksi').substring(0, 200);
    const formattedDate = normalizeDate(payload.date || payload.transactionDate);

    const sql = `
      UPDATE transactions 
      SET notes = :notes, 
          amount = :amount, 
          type = :type, 
          transaction_date = TO_DATE(:trx_date, 'YYYY-MM-DD') 
      WHERE id = :id
    `;

    const binds = {
      notes: notesContent,
      amount: numericAmount,
      type: payload.type || 'in',
      trx_date: formattedDate,
      id: numericId
    };

    return await executeQuery(sql, binds);
  } catch (err: any) {
    console.error('❌ UPDATE TRANSACTION ERROR:', err?.message);
    throw new Error(err?.message || 'Gagal memperbarui transaksi');
  }
}

export async function deleteTransaction(id: number | string) {
  try {
    const cleanId = String(id || '').replace(/\D/g, '');
    const numericId = parseInt(cleanId, 10);

    if (isNaN(numericId)) {
      throw new Error('ID transaksi tidak valid');
    }

    return await executeQuery(`DELETE FROM transactions WHERE id = :id`, { id: numericId });
  } catch (err: any) {
    console.error('❌ DELETE TRANSACTION ERROR:', err?.message);
    throw new Error(err?.message || 'Gagal menghapus transaksi');
  }
}
