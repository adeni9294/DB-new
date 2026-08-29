import oracledb from 'oracledb';
import path from 'path';

let pool: any = null;

export async function getPool() {
  if (pool) return pool;

  // Inisialisasi Wallet Oracle Client
  const walletPath = path.resolve(process.cwd(), process.env.WALLET_DIR || 'wallet');

  try {
    oracledb.initOracleClient({ configDir: walletPath });
  } catch (err: any) {
    // Abaikan jika client sudah diinisialisasi sebelumnya
    if (!err.message?.includes('NJS-077')) {
      console.error('Error initOracleClient:', err);
    }
  }

  pool = await oracledb.createPool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT_STRING,
    poolMin: 1,
    poolMax: 5,
    poolIncrement: 1,
  });

  return pool;
}

// Tambahkan dan export fungsi executeQuery di sini
export async function executeQuery(sql: string, binds: any = {}) {
  const dbPool = await getPool();
  let connection;
  try {
    connection = await dbPool.getConnection();
    const result = await connection.execute(sql, binds, {
      autoCommit: true,
    });
    return result;
  } catch (err) {
    console.error('Database execution error:', err);
    throw err;
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
