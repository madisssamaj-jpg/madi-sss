import { test, describe, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { loginAdminAction } from '../../app/actions/auth-actions.ts';

describe('loginAdminAction dev fallback security', () => {
  const originalEnv = { ...process.env };

  after(() => {
    process.env = originalEnv;
  });

  test('does NOT allow dev admin fallback in production when DB fails', async () => {
    process.env.NODE_ENV = 'production';
    process.env.ALLOW_DEV_ADMIN_FALLBACK = 'true';
    process.env.DIRECT_URL = 'postgresql://invalid:invalid@127.0.0.1:54329/invalid';
    process.env.DATABASE_URL = 'postgresql://invalid:invalid@127.0.0.1:54329/invalid';

    const result = await loginAdminAction({ email: 'admin@localhost.com' });
    assert.equal(result.success, false);
    // In production, when DB fails, dev fallback must NEVER activate
    assert.equal(result.error, 'सर्भरसँग जोडिन सकिएन।');
  });
});
