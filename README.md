# BC Time Clock — Undergraduate Recruitment Office

Web app for Brooklyn College employee clock-in, clock-out, attendance tracking, and timesheet reports.

## Hosting

Follow [the free hosting guide](docs/FREE_HOSTING.md). The included `render.yaml` configures a Free Render web service using a Neon PostgreSQL database. Connect this repository in Render through **New → Blueprint**.

The service requires a private `DATABASE_URL`. Render generates the JWT secrets and administrator registration code automatically. Never commit live credentials or run the demonstration seed on the hosted database.

## Project structure

- `frontend/desktop`: React web app with PC installation and Windows shortcut download.
- `backend`: Express API, Prisma database schema, migrations, and tests.
- `scripts`: hosting build and startup scripts.

## Validation

Backend build, lint, and 19 tests passed during hosting preparation. The web production build passed. Live database access and PC installation must be checked after deployment.

Free hosting has usage limits and idle wake-up delays. This setup is intended for a trial; see the hosting guide before using it for official attendance.
