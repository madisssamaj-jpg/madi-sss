import { Pool } from 'pg';
import type { PoolConfig } from 'pg';

let pool: Pool | null = null;

/**
 * Resets and terminates the active pool instance.
 * Safe to call on connection errors to allow recovery on retry.
 */
export function resetDbPool(): void {
  if (pool) {
    pool.end().catch(() => {});
    pool = null;
  }
}

export function getDbPool(): Pool {
  if (pool) return pool;

  // In serverless environments, prefer transaction pooler (DATABASE_URL / POSTGRES_URL on port 6543)
  // over direct session connection (DIRECT_URL on port 5432) to prevent connection limits.
  const rawUrl =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.DIRECT_URL ||
    process.env.SUPABASE_DB_URL ||
    '';

  if (!rawUrl) {
    throw new Error('Database connection URL is not configured (missing DATABASE_URL / DIRECT_URL).');
  }

  // Parse URL to ensure SSL rejectUnauthorized: false for Supabase cloud pooler
  let config: PoolConfig;
  try {
    const parsed = new URL(rawUrl);
    config = {
      host: parsed.hostname,
      port: parseInt(parsed.port || '5432', 10),
      database: parsed.pathname.replace(/^\//, ''),
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      ssl: {
        rejectUnauthorized: false,
      },
      // In serverless lambdas (Vercel), keep max low per lambda to prevent database pool exhaustion
      max: process.env.NODE_ENV === 'production' ? 2 : 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000, // 10s timeout to allow cross-region cold-start handshakes
    };
  } catch {
    config = {
      connectionString: rawUrl,
      ssl: {
        rejectUnauthorized: false,
      },
      max: process.env.NODE_ENV === 'production' ? 2 : 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };
  }

  pool = new Pool(config);

  pool.on('error', (err: Error) => {
    console.error('Unexpected error on idle PostgreSQL client pool:', err);
    // Invalidate cached pool so subsequent requests attempt fresh connection
    pool = null;
  });

  return pool;
}
