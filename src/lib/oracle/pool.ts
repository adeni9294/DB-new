import oracledb from 'oracledb';

// force out format
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

let pool: any = null;

async function withTimeout<T>(p: Promise<T>, ms: number) {
  let timer: NodeJS.Timeout;
  return await Promise.race([
    p,
    new Promise<T>((_, reject) => {
      timer = setTimeout(() => reject(new Error('timeout')), ms);
    }),
  ]).finally(() => clearTimeout(timer));
}

export async function getPool() {
  if (pool) return pool;
  try {
    console.log('[oracle] creating pool...');
    pool = await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
      poolMin: 0,
      poolMax: 5,
      poolIncrement: 1,
      poolTimeout: 60,
    });
    console.log('[oracle] pool created');
    return pool;
  } catch (err) {
    console.error('[oracle] createPool error', err);
    throw err;
  }
}

export async function executeQuery(sql: string, binds: any = {}, opts: any = {}) {
  // opts: { timeoutMs?, autoCommit? }
  const timeoutMs = typeof opts.timeoutMs === 'number' ? opts.timeoutMs : 8000;
  const autoCommit = opts.autoCommit ?? true;

  const dbPool = await getPool();
  let connection: any | undefined;
  try {
    connection = await withTimeout(dbPool.getConnection(), 5000);
  } catch (err) {
    console.error('[oracle] getConnection failed or timed out', err);
    throw err;
  }

  try {
    console.log('[oracle] executing query', { sql, binds });
    const exec = connection.execute(sql, binds, { autoCommit });
    const result: any = await withTimeout(exec as Promise<any>, timeoutMs);
    // normalize
    if (result && Array.isArray(result.rows)) return result.rows;
    if (result && result.outBinds) return result;
    return [];
  } catch (err) {
    console.error('[oracle] executeQuery error', err);
    throw err;
  } finally {
    try {
      if (connection) await connection.close();
    } catch (e) {
      console.error('[oracle] failed to close connection', e);
    }
  }
}

export async function pingDB() {
  try {
    const rows = await executeQuery('SELECT 1 FROM DUAL', {}, { timeoutMs: 3000 });
    return Array.isArray(rows) && rows.length > 0;
  } catch (e) {
    console.error('[oracle] pingDB failed', e);
    return false;
  }
}
