import { NextResponse } from 'next/server';
import { getPool } from '@/lib/oracle/pool';

export async function GET() {
  let connection;
  const startTime = Date.now();

  try {
    const pool = await getPool();
    connection = await pool.getConnection();

    const result = await connection.execute('SELECT SYSDATE FROM DUAL');
    const latencyMs = Date.now() - startTime;

    return NextResponse.json({
      status: 'OK',
      message: 'Berhasil terhubung ke Oracle Autonomous Database!',
      latencyMs,
      serverTime: result.rows?.[0]?.[0] || null,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'ERROR',
        message: 'Gagal terhubung ke Oracle ADB',
        errorDetails: error.message || String(error),
        errorCode: error.code || null,
      },
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
