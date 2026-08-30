import { executeQuery } from '../pool';

export interface AuditLogItem {
  id?: string;
  userId: string;
  userName?: string;
  action: string;
  entityName: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  createdAt?: string;
}

// Type buat hasil dari DB Oracle
type DbAuditLogRow = {
  id: string;
  user_id: string;
  user_name: string | null;
  action: string;
  entity_name: string;
  entity_id: string | null;
  details: string | null;
  ip_address: string | null;
  created_at: string;
}

export async function logActivity(log: AuditLogItem): Promise<void> {
  const sql = `
    INSERT INTO audit_logs (
      user_id, action, entity_name, entity_id, details, ip_address
    ) VALUES (
      :userId, :action, :entityName, :entityId, :details, :ipAddress
    )
  `;

  try {
    await executeQuery(sql, {
      userId: log.userId,
      action: log.action,
      entityName: log.entityName,
      entityId: log.entityId || null,
      details: log.details || null,
      ipAddress: log.ipAddress || '127.0.0.1',
    });
  } catch (err) {
    console.error('Failed to insert audit log:', err);
  }
}

export async function getRecentAuditLogs(limit = 20): Promise<AuditLogItem[]> {
  const sql = `
    SELECT 
      a.id,
      a.user_id,
      u.name AS user_name,
      a.action,
      a.entity_name,
      a.entity_id,
      a.details,
      a.ip_address,
      TO_CHAR(a.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
    FROM audit_logs a
    LEFT JOIN users u ON a.user_id = u.id
    ORDER BY a.created_at DESC
    FETCH FIRST :limit ROWS ONLY
  `;

  const rows = await executeQuery(sql, { limit }) as DbAuditLogRow[];

  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    userName: r.user_name || 'System',
    action: r.action,
    entityName: r.entity_name,
    entityId: r.entity_id || undefined,
    details: r.details || undefined,
    ipAddress: r.ip_address || undefined,
    createdAt: r.created_at,
  }));
}
