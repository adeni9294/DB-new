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

export async function createTransaction(payload: TransactionDTO) {
  try {
    const rawId = 'TRX-' + Date.now();
    const notesContent = payload.notes || payload.title || payload.description || '';
    const transactionDate = payload.date || new Date().toISOString().split('T')[0];

    // 1. Ambil User ID yang benar-benar ada di tabel USERS
    let validUserId: any = payload.userId;
    if (!validUserId || validUserId === 'USER-001') {
      const userRes: any = await executeQuery(`SELECT id FROM users WHERE ROWNUM <= 1`);
      if (userRes?.rows?.[0]) {
        validUserId = userRes.rows[0].ID ?? userRes.rows[0].id;
      } else {
        validUserId = 1; // Fallback jika tabel users ber-ID angka
      }
    }

    // 2. Ambil Account ID yang benar-benar ada di tabel ACCOUNTS
    let validAccountId: any = payload.accountId;
    if (!validAccountId || validAccountId === 'DEFAULT_ACCOUNT' || validAccountId === 'ACC-DEFAULT') {
      const accRes: any = await executeQuery(`SELECT id FROM accounts WHERE ROWNUM <= 1`);
      
      if (accRes?.rows?.[0]) {
        validAccountId = accRes.rows[0].ID ?? accRes.rows[0].id;
      } else {
        // Jika tabel accounts masih kosong, buat akun default dengan ID angka/unik
        const newAccId = Date.now(); 
        await executeQuery(
          `INSERT INTO accounts (id, name, type, balance, user_id) VALUES (:id, :name, :type, :balance, :userId)`,
          { id: newAccId, name: 'Kas Utama', type: 'CASH', balance: 0, userId: validUserId }
        );
        validAccountId = newAccId;
      }
    }

    // 3. Eksekusi Insert Transaksi dengan data yang dijamin tidak NULL
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
      type: payload.type || 'INCOME',
      amount: Number(payload.amount),
      notes: notesContent,
      transactionDate: transactionDate,
    };

    const result = await executeQuery(sql, binds);
    return result;

  } catch (err: any) {
    console.error('❌ CRITICAL TRANSACTION ERROR:', err?.message);
    throw new Error(err?.message || 'Gagal menyimpan transaksi ke Oracle DB');
  }
}
