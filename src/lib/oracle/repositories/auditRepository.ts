import { executeQuery, getPool } from '../pool';

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

  const rows = await executeQuery<any>(sql, { limit });

  return rows.map((r) => ({
    id: r.ID,
    userId: r.USER_ID,
    userName: r.USER_NAME || 'System',
    action: r.ACTION,
    entityName: r.ENTITY_NAME,
    entityId: r.ENTITY_ID,
    details: r.DETAILS,
    ipAddress: r.IP_ADDRESS,
    createdAt: r.CREATED_AT,
  }));
}
