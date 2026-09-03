import { executeQuery } from '../pool';

export interface TransactionDTO {
  amount: number;
  accountId?: string | number | null;
  type: string;
  category?: string;
  notes?: string;
  title?: string;
  description?: string;
  date?: string;
  userId?: string | number | null;
  [key: string]: any;
}

export async function createTransaction(data: TransactionDTO): Promise<string> {
  const transactionId = 'TRX-' + Date.now();
  const notesContent = data.notes || data.title || data.description || '';

  // 1. Ambil ID user pertama yang valid dari tabel USERS (hasilnya ber-tipe ID angka: 1)
  let activeUserId: any = data.userId || null;
  if (!activeUserId) {
    const userRes: any = await executeQuery(`SELECT id FROM users FETCH FIRST 1 ROWS ONLY`);
    if (userRes?.rows?.[0]) {
      // Menangani format response Oracle DB (baik casing ID maupun id)
      activeUserId = userRes.rows[0].ID ?? userRes.rows[0].id ?? 1;
    } else {
      activeUserId = 1; // Fallback ke ID 1 sesuai data di database
    }
  }

  // 2. Ambil ID account pertama yang valid dari tabel ACCOUNTS
  let activeAccountId: any = data.accountId || null;
  if (!activeAccountId || activeAccountId === 'DEFAULT_ACCOUNT') {
    const accRes: any = await executeQuery(`SELECT id FROM accounts FETCH FIRST 1 ROWS ONLY`);
    if (accRes?.rows?.[0]) {
      activeAccountId = accRes.rows[0].ID ?? accRes.rows[0].id;
    } else {
      activeAccountId = null;
    }
  }

  // 3. Insert transaksi dengan parameter ID yang sudah sesuai tipe data di DB
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
