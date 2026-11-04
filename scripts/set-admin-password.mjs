#!/usr/bin/env node
import bcrypt from 'bcryptjs';
import pg from 'pg';
import readline from 'readline';
import { Writable } from 'stream';

const { Client } = pg;

function createPromptSession() {
  let muted = false;
  const isTTY = Boolean(process.stdin.isTTY);

  const mutableStdout = new Writable({
    write(chunk, encoding, callback) {
      if (!muted) {
        process.stdout.write(chunk, encoding);
      } else {
        const str = chunk.toString();
        if (str === '\r\n' || str === '\n' || str === '\r') {
          process.stdout.write('\n');
        } else if (str.length > 0) {
          process.stdout.write('*');
        }
      }
      callback();
    },
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: isTTY ? mutableStdout : process.stdout,
    terminal: isTTY,
  });

  const iterator = !isTTY ? rl[Symbol.asyncIterator]() : null;

  return {
    async ask(query, isPassword = false) {
      if (!isTTY) {
        process.stdout.write(query);
        const next = await iterator.next();
        return (next.value || '').trim();
      }

      muted = false;
      return new Promise((resolve) => {
        rl.question(query, (answer) => {
          muted = false;
          resolve(answer.trim());
        });
        if (isPassword) {
          muted = true;
        }
      });
    },
    close() {
      rl.close();
    },
  };
}

async function setAdminPassword() {
  // Requirement 8: Do not accept password or arguments as command-line arguments (prevents shell history leakage)
  if (process.argv.length > 2) {
    console.error('SECURITY ERROR: Command-line arguments are not permitted.');
    console.error('Passwords must be entered interactively via the secure prompt to avoid persisting in shell history.');
    console.error('\nExact safe command to run:');
    console.error('  node --env-file=.env.local scripts/set-admin-password.mjs\n');
    process.exit(1);
  }

  console.log('====================================================');
  console.log('  MADI SSS — SECURE ADMIN PASSWORD CONFIGURATION');
  console.log('====================================================');

  const prompt = createPromptSession();

  let targetEmail = '';
  let password = '';
  let confirmPassword = '';

  try {
    // 1. Ask for admin email
    const inputEmail = await prompt.ask('Enter admin email [default: admin@madisss.org.np]: ');
    targetEmail = (inputEmail || 'admin@madisss.org.np').toLowerCase();

    // 2. Ask for new password twice (hidden/masked input)
    password = await prompt.ask('Enter new admin password: ', true);

    if (!password || password.length < 8) {
      console.error('\nError: Password must be at least 8 characters long.');
      process.exit(1);
    }

    confirmPassword = await prompt.ask('Confirm new admin password: ', true);

    // 3. Confirm both entries match
    if (password !== confirmPassword) {
      console.error('\nError: Passwords do not match. Aborting.');
      process.exit(1);
    }
  } finally {
    prompt.close();
  }

  const rawUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!rawUrl) {
    console.error('\nError: Database connection URL is not configured (missing DIRECT_URL / DATABASE_URL).');
    process.exit(1);
  }

  let client;
  try {
    const parsed = new URL(rawUrl);
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
      connectionString: rawUrl,
      ssl: { rejectUnauthorized: false },
    });
  }

  await client.connect();

  try {
    // 5. Hash the password with bcrypt (salt rounds: 10)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 6. Update only the matching active admin user in public.admin_users
    const updateRes = await client.query(
      `UPDATE public.admin_users
       SET password_hash = $1, updated_at = now()
       WHERE lower(email) = $2 AND is_active = true
       RETURNING id, email, full_name, role, is_active;`,
      [passwordHash, targetEmail]
    );

    if (updateRes.rows.length === 0) {
      // Check if user exists but is deactivated
      const checkRes = await client.query(
        `SELECT is_active FROM public.admin_users WHERE lower(email) = $1`,
        [targetEmail]
      );
      if (checkRes.rows.length > 0 && !checkRes.rows[0].is_active) {
        console.error(`\nError: Admin user with email "${targetEmail}" is deactivated (is_active = false).`);
      } else {
        console.error(`\nError: No active admin user found with email "${targetEmail}" in public.admin_users.`);
      }
      process.exit(1);
    }

    const updatedUser = updateRes.rows[0];
    console.log(`\n✓ Password successfully updated and hashed for: ${updatedUser.email}`);
    console.log(`  Name: ${updatedUser.full_name}`);
    console.log(`  Role: ${updatedUser.role}`);
    console.log(`  Status: Active`);
    // 7. Never print the password or its hash
    console.log(`  Security Assurance: Plaintext password and hash are NOT printed or logged.`);
  } finally {
    await client.end();
  }
}

setAdminPassword().catch((err) => {
  console.error('\nUnexpected error while setting admin password:', err.message);
  process.exit(1);
});
