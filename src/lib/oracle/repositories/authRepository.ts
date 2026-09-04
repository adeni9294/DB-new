import { executeQuery } from '../pool';
import crypto from 'crypto';

export interface UserSession {
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  token: string;
}

type DbUserSessionRow = {
  user_id: string;
  user_name: string;
  user_email: string;
  role: string;
  session_token: string;
}

export async function createSession(userId: string): Promise<string> {
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const sql = `
    INSERT INTO user_sessions (user_id, session_token, expires_at)
    VALUES (:userId, :sessionToken, CURRENT_TIMESTAMP + INTERVAL '7' DAY)
  `;

  await executeQuery(sql, { userId, sessionToken });
  return sessionToken;
}

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

  const rows = await executeQuery(sql, { token }) as DbUserSessionRow[];
  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    userId: row.user_id,
    userName: row.user_name,
    userEmail: row.user_email,
    role: row.role,
    token: row.session_token,
  };
}

// Fungsi Tambahan untuk Fitur Pengaturan Profil
export async function updateProfile({ name, email }: { name: string; email: string }) {
  const sql = `
    UPDATE users 
    SET name = :name 
    WHERE email = :email
  `;

  await executeQuery(sql, { name, email });
  return { name, email };
}
