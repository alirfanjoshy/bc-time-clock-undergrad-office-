import request from 'supertest';
import { UserRole } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../app.js';
import { signAccessToken } from '../../utils/tokens.js';

describe('admin authorization', () => {
  const app = createApp();

  it('returns 401 for unauthenticated admin requests', async () => {
    const response = await request(app).get('/api/admin/users');

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 403 when an employee calls an admin endpoint', async () => {
    const token = signAccessToken({
      sub: 'employee-id',
      email: 'al.irfan@brooklyn.cuny.edu',
      role: UserRole.EMPLOYEE,
    });

    const response = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });
});
