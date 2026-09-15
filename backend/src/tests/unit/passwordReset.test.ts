import { beforeEach, describe, expect, it, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import {
  createPasswordResetToken,
  verifyPasswordResetToken,
  requestPasswordReset,
  resetPassword,
} from '../../services/passwordReset.service.js';
import { env } from '../../config/env.js';

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  updateMany: vi.fn(),
  revoke: vi.fn(),
  audit: vi.fn(),
  send: vi.fn(),
  configured: vi.fn(),
  hash: vi.fn(),
}));
vi.mock('../../config/prisma.js', () => ({
  prisma: {
    user: { findUnique: mocks.findUnique },
    $transaction: (fn: (tx: unknown) => unknown) =>
      fn({
        user: { updateMany: mocks.updateMany },
        refreshToken: { updateMany: mocks.revoke },
        auditLog: { create: mocks.audit },
      }),
  },
}));
vi.mock('../../services/mail.service.js', () => ({
  assertMailConfigured: mocks.configured,
  sendResetEmail: mocks.send,
}));
vi.mock('../../utils/password.js', () => ({ hashPassword: mocks.hash }));
const user = {
  id: 'test-user',
  passwordHash: 'old-password-hash',
  email: 'test@example.edu',
  isActive: true,
};
beforeEach(() => {
  vi.clearAllMocks();
  env.PASSWORD_RESET_URL = 'https://timeclock.example.edu/';
  mocks.findUnique.mockResolvedValue(user);
  mocks.updateMany.mockResolvedValue({ count: 1 });
  mocks.hash.mockResolvedValue('new-password-hash');
  mocks.send.mockResolvedValue(undefined);
});
describe('password reset', () => {
  it('issues a 15 minute token restricted to password reset', () => {
    const token = createPasswordResetToken(user);
    const payload = verifyPasswordResetToken(token, user) as jwt.JwtPayload;
    expect(payload.aud).toBe('bc-password-reset');
    expect(payload.exp! - payload.iat!).toBe(900);
    expect(() => jwt.verify(token, env.JWT_ACCESS_SECRET)).toThrow();
  });
  it('rejects tampered, expired, wrong-user and already-used links', () => {
    const token = createPasswordResetToken(user);
    expect(() => verifyPasswordResetToken(token + 'x', user)).toThrow();
    expect(() => verifyPasswordResetToken(token, { ...user, id: 'someone-else' })).toThrow();
    expect(() => verifyPasswordResetToken(token, { ...user, passwordHash: 'new-hash' })).toThrow();
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 16 * 60000);
    expect(() => verifyPasswordResetToken(token, user)).toThrow();
    vi.useRealTimers();
  });
  it('sends a reset link in the fragment and does not return the token', async () => {
    const response = await requestPasswordReset(user.email);
    const url = new URL(mocks.send.mock.calls[0][1]);
    expect(url.origin).toBe('https://timeclock.example.edu');
    expect(url.search).toBe('');
    expect(new URLSearchParams(url.hash.slice(1)).get('resetToken')).toBeTruthy();
    expect(response).toEqual({ message: expect.any(String) });
    expect(JSON.stringify(response)).not.toContain('resetToken');
  });
  it('returns the same response for an unknown or inactive account without sending email', async () => {
    const expected = await requestPasswordReset(user.email);
    mocks.send.mockClear();
    mocks.findUnique.mockResolvedValue(null);
    expect(await requestPasswordReset('missing@example.edu')).toEqual(expected);
    mocks.findUnique.mockResolvedValue({ ...user, isActive: false });
    expect(await requestPasswordReset(user.email)).toEqual(expected);
    expect(mocks.send).not.toHaveBeenCalled();
  });
  it('atomically changes the password, revokes refresh tokens and audits the change', async () => {
    await resetPassword(createPasswordResetToken(user), 'NewPassword123!');
    expect(mocks.updateMany).toHaveBeenCalledWith({
      where: { id: user.id, passwordHash: user.passwordHash, isActive: true },
      data: { passwordHash: 'new-password-hash' },
    });
    expect(mocks.revoke).toHaveBeenCalled();
    expect(mocks.audit).toHaveBeenCalled();
  });
  it('rejects a concurrently consumed token and does not revoke or audit again', async () => {
    mocks.updateMany.mockResolvedValue({ count: 0 });
    await expect(resetPassword(createPasswordResetToken(user), 'NewPassword123!')).rejects.toThrow(
      'invalid or expired',
    );
    expect(mocks.revoke).not.toHaveBeenCalled();
    expect(mocks.audit).not.toHaveBeenCalled();
  });
});
