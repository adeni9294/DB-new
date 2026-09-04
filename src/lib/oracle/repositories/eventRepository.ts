import { executeQuery } from "../pool";

export interface EventRecord {
  ID?: string;
  ORGANIZATION_ID?: string;
  CREATED_BY?: string;
  TITLE: string;
  DESCRIPTION?: string;
  START_DATE: string;
  END_DATE?: string;
  LOCATION: string;
  STATUS?: string;
  CREATED_AT?: Date;
  UPDATED_AT?: Date;
}

export async function getAllEvents() {
  const sql = `
    SELECT ID, TITLE, START_DATE, END_DATE, LOCATION, STATUS, DESCRIPTION 
    FROM EVENTS 
    ORDER BY CREATED_AT DESC
  `;
  const result = await executeQuery<EventRecord>(sql);
  return result.rows || [];
}

export async function createEvent(data: { title: string; startDate: string; endDate?: string; location: string }) {
  const id = Date.now().toString();
  const sql = `
    INSERT INTO EVENTS (ID, TITLE, START_DATE, END_DATE, LOCATION, STATUS, CREATED_AT)
    VALUES (:id, :title, TO_DATE(:startDate, 'YYYY-MM-DD"T"HH24:MI'), TO_DATE(:endDate, 'YYYY-MM-DD"T"HH24:MI'), :location, 'SCHEDULED', SYSDATE)
  `;
  
  await executeQuery(sql, {
    id,
    title: data.title,
    startDate: data.startDate,
    endDate: data.endDate || data.startDate,
    location: data.location,
  });

  return { id, ...data };
}

export async function updateEvent(id: string, data: { title: string; startDate: string; endDate?: string; location: string }) {
  const sql = `
    UPDATE EVENTS 
    SET TITLE = :title, 
        START_DATE = TO_DATE(:startDate, 'YYYY-MM-DD"T"HH24:MI'), 
        END_DATE = TO_DATE(:endDate, 'YYYY-MM-DD"T"HH24:MI'), 
        LOCATION = :location,
        UPDATED_AT = SYSDATE
    WHERE ID = :id
  `;

  await executeQuery(sql, {
    id,
    title: data.title,
    startDate: data.startDate,
    endDate: data.endDate || data.startDate,
    location: data.location,
  });

  return { id, ...data };
}

export async function deleteEvent(id: string) {
  const sql = `DELETE FROM EVENTS WHERE ID = :id`;
  await executeQuery(sql, { id });
  return true;
}
