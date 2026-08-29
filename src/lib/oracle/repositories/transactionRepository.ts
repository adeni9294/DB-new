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
