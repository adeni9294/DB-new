import { executeQuery } from '../pool';

export interface AuditLogDTO {
  userId: string;
  action: string;
  module: string;
  recordId: string;
  oldValue?: string;
  newValue?: string;
}

export async function executeAuditLog(log: AuditLogDTO): Promise<void> {
  const sql = `
    INSERT INTO audit_logs (user_id, action, module, record_id, old_value, new_value)
    VALUES (:userId, :action, :module, :recordId, :oldValue, :newValue)
  `;
  try {
    await executeQuery(sql, {
      userId: log.userId,
      action: log.action,
      module: log.module,
      recordId: log.recordId,
      oldValue: log.oldValue || null,
      newValue: log.newValue || null,
    });
  } catch (err) {
    console.error('❌ Audit Logging Error:', err);
  }
}

export interface TransactionDTO {
  amount: number;
  accountId: string;
  type: string;
  category?: string;
  description?: string;
  userId: string;
}

export async function createTransaction(data: TransactionDTO): Promise<string> {
  const transactionId = 'TRX-' + Date.now();
  const sql = `
    INSERT INTO transactions (id, amount, account_id, type, category, description, user_id, created_at)
    VALUES (:id, :amount, :accountId, :type, :category, :description, :userId, SYSDATE)
  `;

  await executeQuery(sql, {
    id: transactionId,
    amount: data.amount,
    accountId: data.accountId,
    type: data.type,
    category: data.category || null,
    description: data.description || null,
    userId: data.userId,
  });

  return transactionId;
}
