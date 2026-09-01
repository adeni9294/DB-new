import oracledb from 'oracledb';

// PENTING: Harus di paling atas, sebelum createPool
oracledb.initOracleClient({ libDir: '' }); // Mode Thin

let pool: any = null;

export async function getPool() {
  if (pool) return pool;
  pool = await oracledb.createPool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT_STRING,
    poolMin: 0, // <-- ganti jadi 0 biar gak langsung konek pas import
    poolMax: 5,
    poolIncrement: 1,
  });
  return pool;
}

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
  } finally {
    if (connection) await connection.close();
  }
}
