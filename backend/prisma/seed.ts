import bcrypt from 'bcrypt';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const department = await prisma.department.upsert({
    where: { name: 'Undergraduate Recruitment Office' },
    update: {},
    create: { name: 'Undergraduate Recruitment Office' },
  });

  const adminPasswordHash = await bcrypt.hash('AdminPass123!', 12);
  const employeePasswordHash = await bcrypt.hash('EmployeePass123!', 12);

  await prisma.user.upsert({
    where: { email: 'admin@brooklyn.cuny.edu' },
    update: {
      role: UserRole.ADMIN,
      isActive: true,
      departmentId: department.id,
      passwordHash: adminPasswordHash,
    },
    create: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@brooklyn.cuny.edu',
      employeeId: 'ADMIN001',
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      departmentId: department.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'al.irfan@brooklyn.cuny.edu' },
    update: {
      role: UserRole.EMPLOYEE,
      isActive: true,
      departmentId: department.id,
      passwordHash: employeePasswordHash,
    },
    create: {
      firstName: 'Al',
      lastName: 'Irfan',
      email: 'al.irfan@brooklyn.cuny.edu',
      employeeId: '24154531',
      passwordHash: employeePasswordHash,
      role: UserRole.EMPLOYEE,
      departmentId: department.id,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
