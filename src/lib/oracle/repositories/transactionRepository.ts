import { executeQuery } from '../pool';

export interface TransactionDTO {
  amount: number;
  accountId?: string;
  type: string;
  category?: string;
  notes?: string;
  title?: string;
  description?: string;
  date?: string;
  userId?: string;
  [key: string]: any;
}

export async function createTransaction(data: TransactionDTO): Promise<string> {
  const transactionId = 'TRX-' + Date.now();
  const notesContent = data.notes || data.title || data.description || '';

  // 1. Ambil USER_ID valid dari tabel USERS (jika tidak dikirim/invalid)
  let activeUserId = data.userId;
  if (!activeUserId) {
    const userRes: any = await executeQuery(`SELECT id FROM users FETCH FIRST 1 ROWS ONLY`);
    if (userRes?.rows?.[0]?.ID || userRes?.rows?.[0]?.id) {
      activeUserId = userRes.rows[0].ID || userRes.rows[0].id;
    }
  }

  // 2. Ambil ACCOUNT_ID valid dari tabel ACCOUNTS (jika tidak dikirim/invalid)
  let activeAccountId = data.accountId;
  if (!activeAccountId || activeAccountId === 'DEFAULT_ACCOUNT') {
    const accRes: any = await executeQuery(`SELECT id FROM accounts FETCH FIRST 1 ROWS ONLY`);
    if (accRes?.rows?.[0]?.ID || accRes?.rows?.[0]?.id) {
      activeAccountId = accRes.rows[0].ID || accRes.rows[0].id;
    } else {
      activeAccountId = null; // Set null jika kolom mengizinkan NULL
    }
  }

  // 3. Insert transaksi dengan ID referensi yang aman
  const sql = `
    INSERT INTO transactions (id, amount, account_id, type, notes, user_id, transaction_date)
    VALUES (:id, :amount, :accountId, :type, :notes, :userId, SYSDATE)
  `;

  await executeQuery(sql, {
    id: transactionId,
    amount: data.amount,
    accountId: activeAccountId,
    type: data.type,
    notes: notesContent,
    userId: activeUserId,
  });

  return transactionId;
}
