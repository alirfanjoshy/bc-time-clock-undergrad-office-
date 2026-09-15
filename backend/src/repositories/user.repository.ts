import { Prisma, UserRole } from '@prisma/client';
import { prisma } from '../config/prisma.js';

export const safeUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  employeeId: true,
  role: true,
  departmentId: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  department: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.UserSelect;

export type SafeUser = Prisma.UserGetPayload<{ select: typeof safeUserSelect }>;

export function findUserWithPasswordByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: {
      department: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export function findSafeUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: safeUserSelect,
  });
}

export function findSafeUsers() {
  return prisma.user.findMany({
    select: safeUserSelect,
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
  });
}

export function createUser(data: {
  firstName: string;
  lastName: string;
  email: string;
  employeeId?: string;
  passwordHash: string;
  role?: UserRole;
  departmentId: string;
}) {
  return prisma.user.create({
    data,
    select: safeUserSelect,
  });
}

export function findDepartmentById(id: string) {
  return prisma.department.findUnique({
    where: { id },
  });
}

export function findOrCreateDefaultDepartment() {
  return prisma.department.upsert({
    where: { name: 'Undergraduate Recruitment Office' },
    update: {},
    create: { name: 'Undergraduate Recruitment Office' },
  });
}
