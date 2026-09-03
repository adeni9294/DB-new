import { executeQuery } from '../pool';

export interface TransactionDTO {
  notes?: string;
  title?: string;
  amount: number;
  type: string;
  category?: string;
  categoryId?: string;
  date?: string;
  userId?: string | number;
  accountId?: string | number;
  toAccountId?: string | number;
  organizationId?: string | number;
  eventId?: string | number;
  [key: string]: any;
}

export interface TransactionFilterParams {
  userId: string | number;
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
  const transactionId = 'TRX-' + Date.now();
  const notesContent = payload.notes || payload.title || '';

  // 1. Dapatkan USER_ID yang valid (ambil ID=1 dari DB jika tidak ada/salah)
  let activeUserId: any = payload.userId;
  if (!activeUserId || activeUserId === 'USER-001') {
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

  // 2. Dapatkan ACCOUNT_ID yang valid dari tabel ACCOUNTS
  let activeAccountId: any = payload.accountId;
  if (!activeAccountId || activeAccountId === 'DEFAULT_ACCOUNT') {
    try {
      const accRes: any = await executeQuery(`SELECT id FROM accounts FETCH FIRST 1 ROWS ONLY`);
      if (accRes?.rows?.[0]) {
        activeAccountId = accRes.rows[0].ID ?? accRes.rows[0].id;
      } else {
        activeAccountId = null; // Set null jika belum ada akun
      }
    } catch {
      activeAccountId = null;
    }
  }

  const transactionDate = payload.date || new Date().toISOString().split('T')[0];

  // 3. Eksekusi Query INSERT dengan ID dan FK yang aman
  try {
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
      id: transactionId,
      userId: activeUserId,
      accountId: activeAccountId,
      type: payload.type,
      amount: payload.amount,
      notes: notesContent,
      transactionDate: transactionDate,
    };

    const result = await executeQuery(sql, binds);
    return result;
  } catch (err: any) {
    // Fallback jika account_id bernilai NULL dan kolomnya tidak mengizinkan NULL
    console.error('❌ Insert transaksi gagal, mencoba tanpa account_id:', err?.message);
    const fallbackSql = `
      INSERT INTO transactions (
        id, user_id, type, amount, notes, transaction_date
      ) VALUES (
        :id, :userId, :type, :amount, :notes, TO_DATE(:transactionDate, 'YYYY-MM-DD')
      )
    `;
    return await executeQuery(fallbackSql, {
      id: transactionId,
      userId: activeUserId,
      type: payload.type,
      amount: payload.amount,
      notes: notesContent,
      transactionDate: transactionDate,
    });
  }
}

export async function getPaginatedTransactions(params: TransactionFilterParams) {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const offset = (page - 1) * limit;

  let whereClauses = ['t.user_id = :userId'];
  let binds: Record<string, any> = { userId: params.userId };

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

  const sql = `
    SELECT 
      t.id, t.type, t.amount, t.transaction_date, t.notes,
      a.name AS account_name,
      to_a.name AS to_account_name,
      c.name AS category_name,
      o.name AS organization_name,
      e.title AS event_title
    FROM transactions t
    LEFT JOIN accounts a ON t.account_id = a.id
    LEFT JOIN accounts to_a ON t.to_account_id = to_a.id
    LEFT JOIN categories c ON t.category_id = c.id
    LEFT JOIN organizations o ON t.organization_id = o.id
    LEFT JOIN events e ON t.event_id = e.id
    WHERE ${whereSql}
    ORDER BY t.transaction_date DESC
    OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
  `;

  const rows = await executeQuery(sql, binds);
  return rows;
}
