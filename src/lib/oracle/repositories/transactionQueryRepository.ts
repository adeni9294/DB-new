import { executeQuery } from '../pool';

export interface TransactionDTO {
  amount: number;
  accountId?: string | number;
  type: string;
  category?: string;
  notes?: string;
  title?: string;
  description?: string;
  date?: string;
  userId?: string | number;
  [key: string]: any;
}

export interface TransactionFilterParams {
  userId?: string | number;
  search?: string;
  type?: string;
  page?: number;
  limit?: number;
  [key: string]: any;
}

// Helper untuk normalisasi tipe transaksi sesuai CHECK CONSTRAINT database
function normalizeTransactionType(rawType: string): 'INCOME' | 'EXPENSE' | 'TRANSFER' {
  if (!rawType) return 'INCOME';
  
  const normalized = rawType.trim().toUpperCase();
  
  if (normalized === 'PEMASUKAN' || normalized === 'INCOME' || normalized === 'IN') {
    return 'INCOME';
  }
  if (normalized === 'PENGELUARAN' || normalized === 'EXPENSE' || normalized === 'OUT') {
    return 'EXPENSE';
  }
  if (normalized === 'TRANSFER') {
    return 'TRANSFER';
  }

  return 'INCOME'; // Default fallback aman
}

export async function createTransaction(payload: TransactionDTO) {
  try {
    const rawId = 'TRX-' + Date.now();
    const notesContent = payload.notes || payload.title || payload.description || '';
    const transactionDate = payload.date || new Date().toISOString().split('T')[0];

    // Normalisasi nilai type ke UPPERCASE ('INCOME' | 'EXPENSE' | 'TRANSFER')
    const validTransactionType = normalizeTransactionType(payload.type);

    // 1. Dapatkan USER_ID yang valid
    let validUserId: any = payload.userId;
    if (!validUserId || validUserId === 'USER-001') {
      const userRes: any = await executeQuery(`SELECT id FROM users WHERE ROWNUM <= 1`);
      if (userRes?.rows?.[0]) {
        validUserId = userRes.rows[0].ID ?? userRes.rows[0].id;
      } else {
        validUserId = 1;
      }
    }

    // 2. Dapatkan ACCOUNT_ID yang valid
    let validAccountId: any = payload.accountId;
    if (!validAccountId || validAccountId === 'DEFAULT_ACCOUNT' || validAccountId === 'ACC-DEFAULT') {
      const accRes: any = await executeQuery(`SELECT id FROM accounts WHERE ROWNUM <= 1`);
      if (accRes?.rows?.[0]) {
        validAccountId = accRes.rows[0].ID ?? accRes.rows[0].id;
      } else {
        const newAccId = Date.now();
        await executeQuery(
          `INSERT INTO accounts (id, name, type, balance, user_id) VALUES (:id, :name, :type, :balance, :userId)`,
          { id: newAccId, name: 'Kas Utama', type: 'CASH', balance: 0, userId: validUserId }
        );
        validAccountId = newAccId;
      }
    }

    // 3. Simpan Transaksi
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
      id: rawId,
      userId: validUserId,
      accountId: validAccountId,
      type: validTransactionType,
      amount: Number(payload.amount),
      notes: notesContent,
      transactionDate: transactionDate,
    };

    return await executeQuery(sql, binds);

  } catch (err: any) {
    console.error('❌ CRITICAL TRANSACTION ERROR:', err?.message);
    throw new Error(err?.message || 'Gagal menyimpan transaksi ke Oracle DB');
  }
}

export async function getPaginatedTransactions(params: TransactionFilterParams) {
  try {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 20;
    const startRow = (page - 1) * limit + 1;
    const endRow = page * limit;

    const sql = `
      SELECT * FROM (
        SELECT res.*, ROWNUM rnum FROM (
          SELECT 
            t.id, 
            t.type, 
            t.amount, 
            TO_CHAR(t.transaction_date, 'YYYY-MM-DD') AS transaction_date, 
            t.notes,
            t.user_id,
            t.account_id
          FROM transactions t
          ORDER BY t.transaction_date DESC, t.id DESC
        ) res WHERE ROWNUM <= :endRow
      ) WHERE rnum >= :startRow
    `;

    const result: any = await executeQuery(sql, { startRow, endRow });
    const rows = result?.rows || (Array.isArray(result) ? result : []);

    // Mapping key uppercase dari Oracle ke lowercase yang dibutuhkan frontend
    return rows.map((row: any) => ({
      id: row.ID ?? row.id,
      type: row.TYPE ?? row.type ?? 'INCOME',
      amount: Number(row.AMOUNT ?? row.amount ?? 0),
      date: row.TRANSACTION_DATE ?? row.transaction_date,
      title: row.NOTES ?? row.notes ?? 'Transaksi',
      notes: row.NOTES ?? row.notes ?? '',
      category: 'Umum'
    }));

  } catch (err: any) {
    console.error('❌ GET TRANSACTIONS ERROR:', err?.message);
    return [];
  }
}
