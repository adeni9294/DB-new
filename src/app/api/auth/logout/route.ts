import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getPool } from '@/lib/oracle/pool';

export async function POST() {
  let connection;

  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (sessionToken) {
      const pool = await getPool();
      connection = await pool.getConnection();

      // Hapus sesi dari database Oracle ADB
      await connection.execute(
        `DELETE FROM app_user_sessions WHERE session_token = :sessionToken`,
        [sessionToken],
        { autoCommit: true }
      );
    }

    const response = NextResponse.json({ message: 'Logout berhasil' });
    
    // Hapus Cookie
    response.cookies.set('session_token', '', {
      httpOnly: true,
      expires: new Date(0),
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'Gagal melakukan logout', error: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
}
