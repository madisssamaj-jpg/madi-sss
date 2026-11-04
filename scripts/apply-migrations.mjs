import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Client } = pg;

const connectionString =
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Error: DIRECT_URL or DATABASE_URL must be provided in the environment.');
  process.exit(1);
}

const migrationFiles = [
  '20261103000000_init_financial_subsystem.sql',
  '20261103000001_community_cms_modules.sql',
  '20261103000002_media_banners_gallery_settings.sql',
  '20261103000003_constitution_versioning.sql',
  '20261103000004_storage_and_constitution_url.sql',
  '20261103000005_quarantine_non_original_constitution.sql',
  '20261103000006_add_admin_users_password_hash.sql',
  '20261103000007_enable_rls_admin_and_financial.sql',
];

async function run() {
  let client;
  try {
    const parsed = new URL(connectionString);
    client = new Client({
      host: parsed.hostname,
      port: parseInt(parsed.port || '5432', 10),
      database: parsed.pathname.replace(/^\//, ''),
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      ssl: { rejectUnauthorized: false },
    });
  } catch {
    client = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });
  }

  await client.connect();
  console.log('Connected to PostgreSQL for migrations.');

  // Create migrations table if not exists
  await client.query(`
    CREATE TABLE IF NOT EXISTS public._madi_migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT UNIQUE NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  // Check which migrations are already applied
  const appliedRes = await client.query('SELECT filename FROM public._madi_migrations;');
  const appliedSet = new Set(appliedRes.rows.map(r => r.filename));

  // If table was just created but migrations 0-3 were already run, mark 0-3 as applied
  if (appliedSet.size === 0) {
    const checkTable = await client.query(`
      SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'governance_reports';
    `);
    if (checkTable.rows.length > 0) {
      for (let i = 0; i <= 3; i++) {
        await client.query('INSERT INTO public._madi_migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING;', [migrationFiles[i]]);
        appliedSet.add(migrationFiles[i]);
      }
    }
  }

  for (const file of migrationFiles) {
    if (appliedSet.has(file)) {
      console.log(`- Skipping already applied migration: ${file}`);
      continue;
    }

    const filePath = path.join(process.cwd(), 'supabase', 'migrations', file);
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      continue;
    }
    console.log(`Executing migration: ${file}...`);
    const sql = fs.readFileSync(filePath, 'utf-8');
    try {
      await client.query(sql);
      await client.query('INSERT INTO public._madi_migrations (filename) VALUES ($1);', [file]);
      console.log(`✓ Migration ${file} executed successfully.`);
    } catch (err) {
      console.error(`✕ Error executing ${file}:`, err.message);
      throw err;
    }
  }

  // Inspect governance reports
  const gov = await client.query(`
    SELECT id, title_ne, version, effective_date, file_url, status FROM public.governance_reports WHERE category = 'CONSTITUTION';
  `);
  console.log('Constitution records in DB:', gov.rows);

  await client.end();
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
