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

async function main() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('Connected to Supabase PostgreSQL.');

  // 1. Ensure bucket 'media' exists in storage.buckets
  await client.query(`
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES ('media', 'media', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp']::text[])
    ON CONFLICT (id) DO UPDATE SET
      public = true,
      file_size_limit = 52428800;
  `);
  console.log("Verified 'media' bucket.");

  // 2. Ensure RLS policies on storage.objects for 'media'
  await client.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Access Media'
      ) THEN
        CREATE POLICY "Public Access Media" ON storage.objects
        FOR SELECT USING (bucket_id = 'media');
      END IF;
    END $$;
  `);
  console.log('Verified RLS policies on media bucket.');

  const incomingDir = path.resolve('_incoming-photos');
  const files = fs.readdirSync(incomingDir);

  const uploadedRecords = [];

  for (const file of files) {
    // Exclude certificate.jpeg as it is already handled under official documents/governance
    if (file === 'certificate.jpeg') continue;

    const filePath = path.join(incomingDir, file);
    const stats = fs.statSync(filePath);
    if (!stats.isFile()) continue;

    const objName = `madi-sss/incoming/${file}`;
    const ext = path.extname(file).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';

    const metadata = {
      size: stats.size,
      mimetype: mimeType,
      originalFilename: file,
      status: 'DRAFT_PENDING_REVIEW',
      category: 'UNSORTED_PENDING_REVIEW',
      altText: 'Madi SSS photo — pending review',
      isPublic: false,
    };

    const existing = await client.query(
      'SELECT id FROM storage.objects WHERE bucket_id = $1 AND name = $2',
      ['media', objName]
    );

    if (existing.rows.length > 0) {
      await client.query(
        'UPDATE storage.objects SET updated_at = now(), metadata = $1::jsonb WHERE id = $2',
        [JSON.stringify(metadata), existing.rows[0].id]
      );
    } else {
      await client.query(`
        INSERT INTO storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata)
        VALUES (
          gen_random_uuid(),
          'media',
          $1,
          NULL,
          now(),
          now(),
          now(),
          $2::jsonb
        );
      `, [objName, JSON.stringify(metadata)]);
    }

    uploadedRecords.push({
      filename: file,
      objName,
      size: stats.size,
      mimeType,
    });
  }

  console.log(`Successfully uploaded ${uploadedRecords.length} photo records to media/madi-sss/incoming/`);
  await client.end();
}

main().catch((err) => {
  console.error('Upload failed:', err);
  process.exit(1);
});
