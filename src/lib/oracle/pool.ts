import oracledb from 'oracledb';
import path from 'path';

let pool: oracledb.Pool | null = null;

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
