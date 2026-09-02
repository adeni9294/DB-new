export async function GET() {
  // simple health check for Next.js instance and (optionally) DB connectivity
  const start = Date.now();
  let db = 'unknown';
  try {
    // lazy import to avoid cold-start cost if oracle driver not available in some envs
    const { pingDB } = await import('@/lib/oracle/pool');
    const ok = await pingDB();
    db = ok ? 'ok' : 'down';
  } catch (e) {
    console.error('[health] ping error', e);
    db = 'error';
  }

  return new Response(JSON.stringify({ ok: true, db, uptimeMs: Date.now() - start }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}
