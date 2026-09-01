import oracledb from 'oracledb';

// MODE THIN - WAJIB BUAT VERCEL
oracledb.initOracleClient({ libDir: '' }); // <-- KUNCINYA INI

let pool: any = null;

export async function getPool() {
  if (pool) return pool;

  pool = await oracledb.createPool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT_STRING, // format: host:port/service_name
    poolMin: 1,
    poolMax: 5,
    poolIncrement: 1,
  });

  return pool;
}

export const getOraclePool = getPool;

export async function executeQuery(sql: string, binds: any = {}) {
  const dbPool = await getPool();
  let connection;
  try {
    connection = await dbPool.getConnection();
    const result = await connection.execute(sql, binds, {
      autoCommit: true,
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });
    return result.rows || [];
  } catch (err) {
    console.error('Database execution error:', err);
    throw err;
  } finally {
    if (connection) await connection.close();
  }
}
