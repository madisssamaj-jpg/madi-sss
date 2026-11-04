import pg from 'pg';
import fs from 'fs';

const { Pool } = pg;

async function main() {
  const rawUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || '';
  if (!rawUrl) {
    console.error('No connection string in DIRECT_URL / DATABASE_URL');
    process.exit(1);
  }

  const parsed = new URL(rawUrl);
  const pool = new Pool({
    host: parsed.hostname,
    port: parseInt(parsed.port || '5432', 10),
    database: parsed.pathname.replace(/^\//, ''),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
  });

  const tables = [
    'social_activities',
    'relief_programs',
    'events_programs',
    'committee_members',
    'governance_reports',
    'community_partners',
    'membership_applications',
    'feedback_submissions',
    'site_settings',
    'gallery_albums',
    'media_items',
    'site_banners'
  ];

  const results = {};

  for (const t of tables) {
    try {
      const res = await pool.query(`SELECT * FROM public.${t}`);
      results[t] = res.rows;
      console.log(`Table ${t}: ${res.rows.length} rows`);
    } catch (e) {
      console.error(`Error querying ${t}:`, e.message);
      results[t] = [];
    }
  }

  // Also query any other public tables to be completely comprehensive
  try {
    const tableListRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    results._all_tables = tableListRes.rows.map(r => r.table_name);
  } catch (e) {
    console.error('Error fetching tables list:', e.message);
  }

  await pool.end();

  if (!fs.existsSync('scratch')) {
    fs.mkdirSync('scratch', { recursive: true });
  }
  fs.writeFileSync('scratch/cms_audit_raw.json', JSON.stringify(results, null, 2));
  console.log('Saved raw data to scratch/cms_audit_raw.json');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
