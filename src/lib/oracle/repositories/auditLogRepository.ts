import { executeQuery, getOraclePool } from '../pool';
import { executeAuditLog } from './auditLogRepository';

export interface CreateTransactionDTO {
  userId: string;
  accountId: string;
  toAccountId?: string; // Khusus TRANSFER
  categoryId?: string;
  budgetId?: string;
  organizationId?: string;
  eventId?: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  amount: number;
  notes?: string;
  attachmentUrl?: string;
}

export async function createTransaction(dto: CreateTransactionDTO): Promise<string> {
  const pool = await getOraclePool();
  const connection = await pool.getConnection();

  try {
    // 1. Simpan Transaksi
    const trxSql = `
      INSERT INTO transactions (
        user_id, account_id, to_account_id, category_id, budget_id, 
        organization_id, event_id, type, amount, notes, attachment_url
      ) VALUES (
        :userId, :accountId, :toAccountId, :categoryId, :budgetId, 
        :organizationId, :eventId, :type, :amount, :notes, :attachmentUrl
      ) RETURNING id INTO :id
    `;

    const result = await connection.execute(
      trxSql,
      {
        userId: dto.userId,
        accountId: dto.accountId,
        toAccountId: dto.toAccountId || null,
        categoryId: dto.categoryId || null,
        budgetId: dto.budgetId || null,
        organizationId: dto.organizationId || null,
        eventId: dto.eventId || null,
        type: dto.type,
        amount: dto.amount,
        notes: dto.notes || null,
        attachmentUrl: dto.attachmentUrl || null,
        id: { type: 2002, dir: 3003 } // ORACLE BIND OUT (VARCHAR2)
      },
      { autoCommit: false }
    );

    const transactionId = (result.outBinds as any).id[0];

    // 2. Update Saldo Akun Terkait (Context-Aware Balance Engine)
    if (dto.type === 'INCOME') {
      await connection.execute(
        `UPDATE accounts SET balance = balance + :amount, updated_at = CURRENT_TIMESTAMP WHERE id = :accountId`,
        { amount: dto.amount, accountId: dto.accountId }
      );
    } else if (dto.type === 'EXPENSE') {
      await connection.execute(
        `UPDATE accounts SET balance = balance - :amount, updated_at = CURRENT_TIMESTAMP WHERE id = :accountId`,
        { amount: dto.amount, accountId: dto.accountId }
      );
    } else if (dto.type === 'TRANSFER' && dto.toAccountId) {
      // Potong dari akun asal
      await connection.execute(
        `UPDATE accounts SET balance = balance - :amount, updated_at = CURRENT_TIMESTAMP WHERE id = :accountId`,
        { amount: dto.amount, accountId: dto.accountId }
      );
      // Tambah ke akun tujuan
      await connection.execute(
        `UPDATE accounts SET balance = balance + :amount, updated_at = CURRENT_TIMESTAMP WHERE id = :toAccountId`,
        { amount: dto.amount, toAccountId: dto.toAccountId }
      );
    }

    // Commit seluruh operasi
    await connection.commit();

    // 3. Catat ke Audit Log
    await executeAuditLog({
      userId: dto.userId,
      action: 'CREATE_TRANSACTION',
      module: 'TRANSACTIONS',
      recordId: transactionId,
      newValue: JSON.stringify(dto),
    });

    return transactionId;
  } catch (error) {
    await connection.rollback();
    console.error('❌ Failed to create transaction:', error);
    throw new Error('Gagal mencatat transaksi.');
  } finally {
    await connection.close();
  }
}
