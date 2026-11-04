import { Pool } from 'pg';
import type { PoolConfig } from 'pg';

let pool: Pool | null = null;

export function getDbPool(): Pool {
  if (pool) return pool;

  const rawUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || '';
  if (!rawUrl) {
    throw new Error('Database connection URL is not configured (missing DIRECT_URL / DATABASE_URL).');
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
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };
  } catch {
    config = {
      connectionString: rawUrl,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };
  }

  pool = new Pool(config);

  pool.on('error', (err: Error) => {
    console.error('Unexpected error on idle PostgreSQL client pool:', err);
  });

  return pool;
}
