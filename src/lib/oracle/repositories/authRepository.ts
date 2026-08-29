import { executeQuery, getOraclePool } from '../pool';
import crypto from 'crypto';

export interface UserSession {
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  token: string;
}

// Fungsi membuat sesi login baru di Oracle ADB
export async function createSession(userId: string): Promise<string> {
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const sql = `
    INSERT INTO user_sessions (user_id, session_token, expires_at)
    VALUES (:userId, :sessionToken, CURRENT_TIMESTAMP + INTERVAL '7' DAY)
  `;

  await executeQuery(sql, { userId, sessionToken });
  return sessionToken;
}

// Validasi token sesi langsung dari Oracle ADB
export async function validateSession(token: string): Promise<UserSession | null> {
  const sql = `
    SELECT 
      u.id AS user_id, 
      u.name AS user_name, 
      u.email AS user_email, 
      u.role,
      s.session_token
    FROM user_sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.session_token = :token 
      AND s.expires_at > CURRENT_TIMESTAMP
  `;

  const rows = await executeQuery<any>(sql, { token });
  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    userId: row.USER_ID,
    userName: row.USER_NAME,
    userEmail: row.USER_EMAIL,
    role: row.ROLE,
    token: row.SESSION_TOKEN,
  };
}
