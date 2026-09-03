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
  category_id?: string;
  notes?: string;       // Disesuaikan dengan nama kolom DB
  title?: string;       // Tambahkan support untuk input 'title' dari frontend
  description?: string; // Menyimpan fallback jika ada yang memanggil 'description'
  date?: string;
  userId: string;
  [key: string]: any;   // Mencegah error tipe di build Vercel
}

export async function createTransaction(data: TransactionDTO): Promise<string> {
  const transactionId = 'TRX-' + Date.now();
  const notesContent = data.notes || data.title || data.description || '';

  const sql = `
    INSERT INTO transactions (id, amount, account_id, type, notes, user_id, transaction_date)
    VALUES (:id, :amount, :accountId, :type, :notes, :userId, SYSDATE)
  `;

  await executeQuery(sql, {
    id: transactionId,
    amount: data.amount,
    accountId: data.accountId,
    type: data.type,
    notes: notesContent,
    userId: data.userId,
  });

  return transactionId;
}
