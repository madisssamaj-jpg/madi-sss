import pg from 'pg';
const { Client } = pg;

const connectionString =
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Error: DIRECT_URL or DATABASE_URL must be provided in the environment.');
  process.exit(1);
}

async function main() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('Connected to PostgreSQL.');

  // 1. Ensure bucket exists
  await client.query(`
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES ('official-documents', 'official-documents', true, 52428800, ARRAY['application/pdf']::text[])
    ON CONFLICT (id) DO UPDATE SET
      public = true,
      file_size_limit = 52428800,
      allowed_mime_types = ARRAY['application/pdf']::text[];
  `);
  console.log('Bucket verified.');

  // 2. Ensure RLS policies on storage.objects & storage.buckets
  await client.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Access Official Documents'
      ) THEN
        CREATE POLICY "Public Access Official Documents" ON storage.objects
        FOR SELECT USING (bucket_id = 'official-documents');
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'buckets' AND policyname = 'Public Read Buckets'
      ) THEN
        CREATE POLICY "Public Read Buckets" ON storage.buckets
        FOR SELECT USING (true);
      END IF;
    END $$;
  `);
  console.log('Storage RLS policies verified.');

  // 3. Insert or update the Constitution object metadata
  const objName = 'constitution/madi-sss-constitution-2082-v1.pdf';
  const existing = await client.query('SELECT id FROM storage.objects WHERE bucket_id = $1 AND name = $2', [
    'official-documents',
    objName,
  ]);

  if (existing.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata)
      VALUES (
        gen_random_uuid(),
        'official-documents',
        '${objName}',
        NULL,
        now(),
        now(),
        now(),
        '{"size": 10418835, "mimetype": "application/pdf", "cacheControl": "max-age=3600"}'::jsonb
      )
      RETURNING id, name, bucket_id;
    `);
    console.log('Inserted storage object:', ins.rows[0]);
  } else {
    console.log('Storage object already exists:', existing.rows[0]);
  }

  await client.end();
}

main().catch((err) => {
  console.error('Setup error:', err);
  process.exit(1);
});
