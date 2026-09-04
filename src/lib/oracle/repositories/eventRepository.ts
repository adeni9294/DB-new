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
    SELECT 
      ID, 
      TITLE, 
      TO_CHAR(START_DATE, 'YYYY-MM-DD"T"HH24:MI:SS') AS START_DATE, 
      TO_CHAR(END_DATE, 'YYYY-MM-DD"T"HH24:MI:SS') AS END_DATE, 
      LOCATION, 
      STATUS, 
      DESCRIPTION 
    FROM EVENTS 
    ORDER BY CREATED_AT DESC
  `;
  
  const result: any = await executeQuery(sql);
  
  // Oracle node-oracledb mengembalikan rows sebagai array of arrays atau array of objects
  return (result?.rows || []).map((row: any) => ({
    ID: row.ID || row[0],
    TITLE: row.TITLE || row[1],
    START_DATE: row.START_DATE || row[2],
    END_DATE: row.END_DATE || row[3],
    LOCATION: row.LOCATION || row[4],
    STATUS: row.STATUS || row[5],
    DESCRIPTION: row.DESCRIPTION || row[6],
  }));
}
export async function createEvent(data: { 
  title: string; 
  startDate: string; 
  endDate?: string; 
  location: string;
  createdBy?: string; 
}) {
  const id = Date.now().toString();
  const createdBy = data.createdBy || 'ADMIN'; 

  const sql = `
    INSERT INTO EVENTS (
      ID, 
      CREATED_BY, 
      TITLE, 
      START_DATE, 
      END_DATE, 
      LOCATION, 
      STATUS, 
      CREATED_AT
    )
    VALUES (
      :id, 
      :createdBy, 
      :title, 
      TO_DATE(:startDate, 'YYYY-MM-DD"T"HH24:MI'), 
      TO_DATE(:endDate, 'YYYY-MM-DD"T"HH24:MI'), 
      :location, 
      'ACTIVE', 
      SYSDATE
    )
  `;
  
  await executeQuery(sql, {
    id,
    createdBy,
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
