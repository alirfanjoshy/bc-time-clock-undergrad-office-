import { UserRole } from '@prisma/client';
import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import {
  createRefreshToken,
  hashToken,
  refreshTokenExpiry,
  signAccessToken,
} from '../utils/tokens.js';
import {
  createRefreshTokenRecord,
  findRefreshToken,
  revokeRefreshToken,
} from '../repositories/refreshToken.repository.js';
import {
  createUser,
  findDepartmentById,
  findOrCreateDefaultDepartment,
  findSafeUserById,
  findUserWithPasswordByEmail,
} from '../repositories/user.repository.js';
import { LoginInput, RefreshInput, RegisterInput } from '../schemas/auth.schema.js';

type RequestMeta = {
  ipAddress?: string;
  userAgent?: string;
};

function toAuthUser(user: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeId: string;
  role: 'EMPLOYEE' | 'ADMIN';
  departmentId: string;
  isActive: boolean;
}) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    employeeId: user.employeeId,
    role: user.role,
    departmentId: user.departmentId,
    isActive: user.isActive,
  };
}

async function issueTokens(user: {
  id: string;
  email: string;
  role: 'EMPLOYEE' | 'ADMIN';
}, meta: RequestMeta) {
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });
  const refreshToken = createRefreshToken();

  await createRefreshTokenRecord({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: refreshTokenExpiry(),
    createdByIp: meta.ipAddress,
  });

  return { accessToken, refreshToken };
}

export async function registerEmployee(input: RegisterInput, meta: RequestMeta) {
  if (input.role === UserRole.ADMIN && input.adminRegistrationCode !== env.ADMIN_REGISTRATION_CODE) {
    throw new AppError(403, 'INVALID_ADMIN_SETUP_CODE', 'A valid admin setup code is required.');
  }

  const department = input.departmentId
    ? await findDepartmentById(input.departmentId)
    : await findOrCreateDefaultDepartment();

  if (!department) {
    throw new AppError(400, 'INVALID_DEPARTMENT', 'Department does not exist.');
  }

  const passwordHash = await hashPassword(input.password);
  const user = await createUser({
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    departmentId: department.id,
    role: input.role,
    passwordHash,
  });

  const tokens = await issueTokens(user, meta);

  return {
    ...tokens,
    user,
  };
}

export async function login(input: LoginInput, meta: RequestMeta) {
  const user = await findUserWithPasswordByEmail(input.email);

  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
  }

  if (!user.isActive) {
    throw new AppError(403, 'ACCOUNT_INACTIVE', 'This account is inactive.');
  }

  const tokens = await issueTokens(user, meta);

  return {
    ...tokens,
    user: toAuthUser(user),
  };
}

export async function refresh(input: RefreshInput, meta: RequestMeta) {
  const tokenHash = hashToken(input.refreshToken);
  const existing = await findRefreshToken(tokenHash);

  if (!existing || existing.revokedAt || existing.expiresAt <= new Date()) {
    throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token is invalid or expired.');
  }

  if (!existing.user.isActive) {
    throw new AppError(403, 'ACCOUNT_INACTIVE', 'This account is inactive.');
  }

  await revokeRefreshToken(tokenHash, meta.ipAddress);
  const tokens = await issueTokens(existing.user, meta);

  return {
    ...tokens,
    user: toAuthUser(existing.user),
  };
}

export async function logout(input: RefreshInput, meta: RequestMeta) {
  await revokeRefreshToken(hashToken(input.refreshToken), meta.ipAddress);
}

export async function getCurrentUser(userId: string) {
  const user = await findSafeUserById(userId);

  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'User not found.');
  }

  if (!user.isActive) {
    throw new AppError(403, 'ACCOUNT_INACTIVE', 'This account is inactive.');
  }

  return user;
}
