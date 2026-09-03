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

function normalizeTransactionType(rawType: string): 'INCOME' | 'EXPENSE' | 'TRANSFER' {
  if (!rawType) return 'INCOME';
  const normalized = rawType.trim().toUpperCase();
  if (normalized === 'PEMASUKAN' || normalized === 'INCOME' || normalized === 'IN') return 'INCOME';
  if (normalized === 'PENGELUARAN' || normalized === 'EXPENSE' || normalized === 'OUT') return 'EXPENSE';
  if (normalized === 'TRANSFER') return 'TRANSFER';
  return 'INCOME';
}

export async function createTransaction(payload: TransactionDTO) {
  try {
    const rawId = 'TRX-' + Date.now();
    const notesContent = payload.notes || payload.title || payload.description || '';
    const transactionDate = payload.date || new Date().toISOString().split('T')[0];
    const validTransactionType = normalizeTransactionType(payload.type);

    let validUserId: any = payload.userId;
    if (!validUserId || validUserId === 'USER-001') {
      const userRes: any = await executeQuery(`SELECT id FROM users WHERE ROWNUM <= 1`);
      validUserId = userRes?.rows?.[0]?.ID ?? userRes?.rows?.[0]?.id ?? 1;
    }

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

    const sql = `
      INSERT INTO transactions (
        id, user_id, account_id, type, amount, notes, transaction_date
      ) VALUES (
        :id, :userId, :accountId, :type, :amount, :notes, TO_DATE(:transactionDate, 'YYYY-MM-DD')
      )
    `;

    return await executeQuery(sql, {
      id: rawId,
      userId: validUserId,
      accountId: validAccountId,
      type: validTransactionType,
      amount: Number(payload.amount),
      notes: notesContent,
      transactionDate: transactionDate,
    });
  } catch (err: any) {
    console.error('❌ CRITICAL TRANSACTION ERROR:', err?.message);
    throw new Error(err?.message || 'Gagal menyimpan transaksi ke Oracle DB');
  }
}

export async function getPaginatedTransactions(params?: TransactionFilterParams) {
  try {
    // Query polos tanpa bind parameter agar 100% aman dari ORA-00923
    const sql = `
      SELECT 
        id, 
        type, 
        amount, 
        TO_CHAR(transaction_date, 'YYYY-MM-DD') AS transaction_date, 
        notes, 
        user_id, 
        account_id 
      FROM transactions 
      ORDER BY transaction_date DESC, id DESC
    `;

    const result: any = await executeQuery(sql);
    const rows = result?.rows || (Array.isArray(result) ? result : []);

    return rows.map((row: any) => ({
      id: row.ID ?? row.id ?? row[0],
      type: row.TYPE ?? row.type ?? row[1] ?? 'INCOME',
      amount: Number(row.AMOUNT ?? row.amount ?? row[2] ?? 0),
      date: row.TRANSACTION_DATE ?? row.transaction_date ?? row[3],
      title: row.NOTES ?? row.notes ?? row[4] ?? 'Transaksi',
      notes: row.NOTES ?? row.notes ?? row[4] ?? '',
      category: 'Umum'
    }));
  } catch (err: any) {
    console.error('❌ GET TRANSACTIONS ERROR:', err?.message);
    return [];
  }
}
