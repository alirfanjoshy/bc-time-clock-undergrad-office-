import { UserRole } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { authorize } from '../../middleware/authorize.js';

describe('authorize middleware', () => {
  it('allows an admin through admin-only middleware', () => {
    const req = {
      user: {
        id: 'admin-id',
        email: 'admin@brooklyn.cuny.edu',
        role: UserRole.ADMIN,
      },
    };
    const next = vi.fn();

    authorize(UserRole.ADMIN)(req as never, {} as never, next);

    expect(next).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith();
  });

  it('rejects an employee from admin-only middleware', () => {
    const req = {
      user: {
        id: 'employee-id',
        email: 'al.irfan@brooklyn.cuny.edu',
        role: UserRole.EMPLOYEE,
      },
    };
    const next = vi.fn();

    authorize(UserRole.ADMIN)(req as never, {} as never, next);

    expect(next).toHaveBeenCalledOnce();
    const error = next.mock.calls[0]?.[0];
    expect(error).toMatchObject({
      statusCode: 403,
      code: 'FORBIDDEN',
    });
  });
});
