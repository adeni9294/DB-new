import oracledb from 'oracledb';

// HAPUS initOracleClient. Kita paksa mode Thin
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

let pool: any = null;

export async function getPool() {
  if (pool) return pool;
  pool = await oracledb.createPool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT_STRING,
    poolMin: 0,
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
    });
    return result.outBinds ? result : (result.rows || []);
  } finally {
    if (connection) await connection.close();
  }
}
