import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ypcrfeufdghpxhhjexja.supabase.co';
const BUCKET_NAME = 'official-documents';
const STORAGE_PATH = 'constitution/madi-sss-constitution-2082-v1.pdf';
const LOCAL_PATH = path.join(process.cwd(), 'public', 'documents', 'madi-sss-constitution-2082.pdf');

async function main() {
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.argv[2];

  console.log('--- Madi SSS Constitution Supabase Storage Uploader ---');
  console.log(`Target Supabase URL : ${SUPABASE_URL}`);
  console.log(`Target Bucket       : ${BUCKET_NAME}`);
  console.log(`Target Object Path  : ${STORAGE_PATH}`);
  console.log(`Source Local File   : ${LOCAL_PATH}`);

  if (!fs.existsSync(LOCAL_PATH)) {
    console.error(`Error: Source file not found at ${LOCAL_PATH}`);
    process.exit(1);
  }

  const fileBuffer = fs.readFileSync(LOCAL_PATH);
  console.log(`Loaded file: ${(fileBuffer.length / (1024 * 1024)).toFixed(2)} MB (${fileBuffer.length} bytes)`);

  if (!serviceKey) {
    console.log('\n[NOTICE] No SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY detected.');
    console.log('To upload directly from your terminal, execute:');
    console.log('  node scripts/upload-constitution.mjs <YOUR_SUPABASE_KEY>');
    console.log('\nAlternatively, upload via Supabase Dashboard:');
    console.log(`  1. Open ${SUPABASE_URL}/storage/buckets`);
    console.log(`  2. Select bucket "${BUCKET_NAME}"`);
    console.log(`  3. Create folder "constitution" and upload as "madi-sss-constitution-2082-v1.pdf"`);
    return;
  }

  console.log('Uploading file to Supabase Storage...');
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${STORAGE_PATH}`;

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      'Content-Type': 'application/pdf',
      'x-upsert': 'true',
    },
    body: fileBuffer,
  });

  const bodyText = await res.text();
  console.log(`Upload HTTP Status: ${res.status}`);
  console.log(`Response: ${bodyText}`);

  if (res.ok) {
    console.log('\n✓ Upload successful! Verifying public download URL...');
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${STORAGE_PATH}`;
    const testRes = await fetch(publicUrl);
    console.log(`Public URL Verification Status: ${testRes.status}`);
    if (testRes.ok) {
      console.log(`✓ VERIFIED: The public Supabase Storage URL is live and returning 200 OK!`);
      console.log(`  URL: ${publicUrl}`);
    } else {
      console.warn(`Warning: Public URL returned ${testRes.status}. Check bucket public policy.`);
    }
  } else {
    console.error(`Upload failed with status ${res.status}: ${bodyText}`);
  }
}

main().catch(console.error);

