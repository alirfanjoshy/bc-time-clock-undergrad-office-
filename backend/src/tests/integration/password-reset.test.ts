import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../../app.js';
const mocks = vi.hoisted(() => ({ request: vi.fn(), reset: vi.fn() }));
vi.mock('../../services/passwordReset.service.js', () => ({
  requestPasswordReset: mocks.request,
  resetPassword: mocks.reset,
}));
const app = createApp();
describe('password reset routes', () => {
  it('validates email before calling the service', async () => {
    const result = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'not-an-email' });
    expect(result.status).toBe(400);
    expect(mocks.request).not.toHaveBeenCalled();
  });
  it('normalizes account email and returns a generic message', async () => {
    mocks.request.mockResolvedValue({ message: 'Check your inbox.' });
    const result = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: ' TEST@EXAMPLE.EDU ' });
    expect(result.status).toBe(200);
    expect(mocks.request).toHaveBeenCalledWith('test@example.edu');
    expect(result.body.data.message).toBe('Check your inbox.');
  });
  it('rejects short passwords and missing tokens', async () => {
    expect(
      (
        await request(app)
          .post('/api/auth/reset-password')
          .send({ token: 'token', password: 'short' })
      ).status,
    ).toBe(400);
    expect(
      (await request(app).post('/api/auth/reset-password').send({ password: 'GoodPassword123!' }))
        .status,
    ).toBe(400);
    expect(mocks.reset).not.toHaveBeenCalled();
  });
  it('accepts a reset token and a valid password', async () => {
    mocks.reset.mockResolvedValue({ message: 'Password updated.' });
    const result = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'test-token', password: 'GoodPassword123!' });
    expect(result.status).toBe(200);
    expect(mocks.reset).toHaveBeenCalledWith('test-token', 'GoodPassword123!');
  });
  it('limits repeated requests for the same address', async () => {
    for (let i = 0; i < 5; i++)
      await request(app).post('/api/auth/forgot-password').send({ email: 'limited@example.edu' });
    const result = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'limited@example.edu' });
    expect(result.status).toBe(429);
    expect(result.headers['retry-after']).toBe('900');
  });
});
