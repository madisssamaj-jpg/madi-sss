import { test, describe, after } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { clearRateLimits } from '../../lib/security/rate-limit.ts';

describe('Admin Password Authentication & Invariants', () => {
  test('bcrypt hashes and verifies passwords securely', async () => {
    const rawPassword = 'SuperSecretAdminPassword2026!';
    const hash = await bcrypt.hash(rawPassword, 10);

    assert.notEqual(rawPassword, hash);
    assert.equal(await bcrypt.compare(rawPassword, hash), true);
    assert.equal(await bcrypt.compare('WrongPassword', hash), false);
    assert.equal(await bcrypt.compare('', hash), false);
  });

  test('Missing password_hash or empty password strictly fails verification', async () => {
    const checkVerify = (password: string, hash: string | null | undefined) => {
      if (!hash || !password) return false;
      return bcrypt.compareSync(password, hash);
    };

    assert.equal(checkVerify('MyPassword', null), false);
    assert.equal(checkVerify('MyPassword', undefined), false);
    assert.equal(checkVerify('', '$2b$10$...'), false);
  });
});

