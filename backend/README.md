# Backend

Node.js, TypeScript, Express, PostgreSQL, Prisma, JWT, bcrypt, and Zod backend for the Brooklyn College Undergraduate Recruitment Office Time Clock system.

## Setup

```bash
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

## Development Logins

Admin:

```text
email: admin@brooklyn.cuny.edu
password: AdminPass123!
```

Employee:

```text
email: al.irfan@brooklyn.cuny.edu
password: EmployeePass123!
```

## Useful Commands

```bash
npm run build
npm test
npm run lint
npm run prisma:seed
```
