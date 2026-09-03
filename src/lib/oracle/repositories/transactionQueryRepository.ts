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
  type?: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  accountId?: string | number;
  categoryId?: string | number;
  organizationId?: string | number;
  eventId?: string | number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export async function createTransaction(payload: TransactionDTO) {
  try {
    const rawId = 'TRX-' + Date.now();
    const notesContent = payload.notes || payload.title || payload.description || '';
    const transactionDate = payload.date || new Date().toISOString().split('T')[0];

    // 1. Dapatkan USER_ID valid dari tabel USERS
    let validUserId: any = payload.userId;
    if (!validUserId || validUserId === 'USER-001') {
      const userRes: any = await executeQuery(`SELECT id FROM users WHERE ROWNUM <= 1`);
      if (userRes?.rows?.[0]) {
        validUserId = userRes.rows[0].ID ?? userRes.rows[0].id;
      } else {
        validUserId = 1;
      }
    }

    // 2. Dapatkan ACCOUNT_ID valid dari tabel ACCOUNTS
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

    const binds = {
      id: rawId,
      userId: validUserId,
      accountId: validAccountId,
      type: payload.type || 'INCOME',
      amount: Number(payload.amount),
      notes: notesContent,
      transactionDate: transactionDate,
    };

    return await executeQuery(sql, binds);
  } catch (err: any) {
    console.error('❌ CREATE TRANSACTION ERROR:', err?.message);
    throw new Error(err?.message || 'Gagal menyimpan transaksi ke Oracle DB');
  }
}

export async function getPaginatedTransactions(params: TransactionFilterParams) {
  try {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const offset = (page - 1) * limit;

    // 1. Ambil USER_ID valid jika params.userId kosong/invalid
    let targetUserId: any = params.userId;
    if (!targetUserId || targetUserId === 'USER-001') {
      const userRes: any = await executeQuery(`SELECT id FROM users WHERE ROWNUM <= 1`);
      if (userRes?.rows?.[0]) {
        targetUserId = userRes.rows[0].ID ?? userRes.rows[0].id;
      } else {
        targetUserId = 1;
      }
    }

    let whereClauses = ['t.user_id = :userId'];
    let binds: Record<string, any> = { userId: targetUserId };

    if (params.search) {
      whereClauses.push('(LOWER(t.notes) LIKE :search OR LOWER(c.name) LIKE :search)');
      binds.search = `%${params.search.toLowerCase()}%`;
    }
    if (params.type) {
      whereClauses.push('t.type = :type');
      binds.type = params.type;
    }
    if (params.accountId) {
      whereClauses.push('(t.account_id = :accountId OR t.to_account_id = :accountId)');
      binds.accountId = params.accountId;
    }
    if (params.categoryId) {
      whereClauses.push('t.category_id = :categoryId');
      binds.categoryId = params.categoryId;
    }
    if (params.organizationId) {
      whereClauses.push('t.organization_id = :organizationId');
      binds.organizationId = params.organizationId;
    }
    if (params.eventId) {
      whereClauses.push('t.event_id = :eventId');
      binds.eventId = params.eventId;
    }
    if (params.startDate && params.endDate) {
      whereClauses.push('t.transaction_date BETWEEN TO_TIMESTAMP(:startDate, \'YYYY-MM-DD\') AND TO_TIMESTAMP(:endDate, \'YYYY-MM-DD\')');
      binds.startDate = params.startDate;
      binds.endDate = params.endDate;
    }

    const whereSql = whereClauses.join(' AND ');

    // 2. Query standar Oracle 12c+ dengan OFFSET & FETCH NEXT
    const sql = `
      SELECT 
        t.id, 
        t.type, 
        t.amount, 
        t.transaction_date, 
        t.notes,
        a.name AS account_name,
        c.name AS category_name
      FROM transactions t
      LEFT JOIN accounts a ON t.account_id = a.id
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE ${whereSql}
      ORDER BY t.transaction_date DESC
      OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
    `;

    const result: any = await executeQuery(sql, binds);
    return result?.rows || result || [];
  } catch (err: any) {
    console.error('❌ GET TRANSACTIONS ERROR:', err?.message);
    throw new Error(err?.message || 'Gagal mengambil data transaksi dari Oracle DB');
  }
}
