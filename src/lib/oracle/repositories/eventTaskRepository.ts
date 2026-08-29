import { executeQuery, getOraclePool } from '../pool';

export interface EventDTO {
  organizationId?: string;
  createdBy: string;
  title: string;
  description?: string;
  startDate: string; // YYYY-MM-DD HH24:MI
  endDate: string;   // YYYY-MM-DD HH24:MI
  location?: string;
}

export interface TaskDTO {
  userId: string;
  organizationId?: string;
  eventId?: string;
  assignedTo?: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export async function createEvent(dto: EventDTO): Promise<string> {
  const sql = `
    INSERT INTO events (
      organization_id, created_by, title, description, 
      start_date, end_date, location, status
    ) VALUES (
      :organizationId, :createdBy, :title, :description,
      TO_TIMESTAMP(:startDate, 'YYYY-MM-DD HH24:MI'),
      TO_TIMESTAMP(:endDate, 'YYYY-MM-DD HH24:MI'),
      :location, 'PLANNING'
    ) RETURNING id INTO :id
  `;

  const pool = await getOraclePool();
  const conn = await pool.getConnection();

  try {
    const res = await conn.execute(
      sql,
      {
        organizationId: dto.organizationId || null,
        createdBy: dto.createdBy,
        title: dto.title,
        description: dto.description || null,
        startDate: dto.startDate,
        endDate: dto.endDate,
        location: dto.location || null,
        id: { type: 2002, dir: 3003 }
      },
      { autoCommit: true }
    );
    return (res.outBinds as any).id[0];
  } finally {
    await conn.close();
  }
}

export async function updateTaskStatus(taskId: string, status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'): Promise<void> {
  const sql = `
    UPDATE tasks 
    SET status = :status, updated_at = CURRENT_TIMESTAMP 
    WHERE id = :taskId
  `;
  await executeQuery(sql, { status, taskId });
}
