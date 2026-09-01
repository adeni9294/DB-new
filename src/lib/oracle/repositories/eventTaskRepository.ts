import { executeQuery } from '../pool'; // BENER
import oracledb from 'oracledb';

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
  dueDate?: string; // YYYY-MM-DD
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

// Type buat hasil DB
type DbEventRow = { id: string }
type DbTaskRow = { id: string }

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

  const pool = await executeQuery();
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
        id: { dir: oracledb.BIND_OUT, type: oracledb.STRING }
      },
      { autoCommit: true }
    );
    return (res.outBinds as DbEventRow).id;
  } finally {
    await conn.close();
  }
}

export async function createTask(dto: TaskDTO): Promise<string> {
  const sql = `
    INSERT INTO tasks (
      created_by, organization_id, event_id, assigned_to, 
      title, description, due_date, priority, status
    ) VALUES (
      :userId, :organizationId, :eventId, :assignedTo,
      :title, :description, 
      TO_DATE(:dueDate, 'YYYY-MM-DD'),
      :priority, 'TODO'
    ) RETURNING id INTO :id
  `;

  const pool = await executeQuery();
  const conn = await pool.getConnection();

  try {
    const res = await conn.execute(
      sql,
      {
        userId: dto.userId,
        organizationId: dto.organizationId || null,
        eventId: dto.eventId || null,
        assignedTo: dto.assignedTo || null,
        title: dto.title,
        description: dto.description || null,
        dueDate: dto.dueDate || null,
        priority: dto.priority,
        id: { dir: oracledb.BIND_OUT, type: oracledb.STRING }
      },
      { autoCommit: true }
    );
    return (res.outBinds as DbTaskRow).id;
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

export async function getEventsByOrg(orgId: string) {
  const sql = `
    SELECT id, title, description, 
           TO_CHAR(start_date, 'YYYY-MM-DD HH24:MI') as start_date,
           TO_CHAR(end_date, 'YYYY-MM-DD HH24:MI') as end_date,
           location, status
    FROM events 
    WHERE organization_id = :orgId 
    ORDER BY start_date DESC
  `;
  return await executeQuery(sql, { orgId });
}
