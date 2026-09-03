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

  // 1. Ambil ID User valid dari tabel USERS (fallback: angka 1)
  let activeUserId: any = data.userId || null;
  if (!activeUserId) {
    try {
      const userRes: any = await executeQuery(`SELECT id FROM users FETCH FIRST 1 ROWS ONLY`);
      if (userRes?.rows?.[0]) {
        activeUserId = userRes.rows[0].ID ?? userRes.rows[0].id ?? 1;
      } else {
        activeUserId = 1;
      }
    } catch {
      activeUserId = 1;
    }
  }

  // 2. Cek apakah ada Account ID yang bisa dipakai. Jika kosong, buat akun default otomatis.
  let activeAccountId: any = data.accountId || null;
  if (!activeAccountId || activeAccountId === 'DEFAULT_ACCOUNT') {
    try {
      const accRes: any = await executeQuery(`SELECT id FROM accounts FETCH FIRST 1 ROWS ONLY`);
      if (accRes?.rows?.[0]) {
        activeAccountId = accRes.rows[0].ID ?? accRes.rows[0].id;
      } else {
        // Buat akun default di tabel ACCOUNTS jika tabel kosong
        const newAccId = 'ACC-DEFAULT';
        await executeQuery(
          `INSERT INTO accounts (id, name, type, balance, user_id) VALUES (:id, :name, :type, :balance, :userId)`,
          { id: newAccId, name: 'Kas Utama', type: 'CASH', balance: 0, userId: activeUserId }
        );
        activeAccountId = newAccId;
      }
    } catch (e) {
      console.warn('⚠️ Gagal mengambil/membuat account_id, mencoba NULL:', e);
      activeAccountId = null;
    }
  }

  // 3. Simpan transaksi
  try {
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
  } catch (dbError: any) {
    // Jika masih gagal karena FK Constraint account_id, jalankan Fallback Insert tanpa account_id
    console.error('❌ Direct INSERT failed, trying fallback query:', dbError?.message);
    const fallbackSql = `
      INSERT INTO transactions (id, amount, type, notes, user_id, transaction_date)
      VALUES (:id, :amount, :type, :notes, :userId, SYSDATE)
    `;
    await executeQuery(fallbackSql, {
      id: transactionId,
      amount: data.amount,
      type: data.type,
      notes: notesContent,
      userId: activeUserId,
    });
    return transactionId;
  }
}
