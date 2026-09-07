# RBAC Service Setup

The RBAC service manages roles and role assignments for users and client applications. It is called by the client service and protects its API with client authentication.

## Responsibilities

- Create, update, delete, and list roles.
- List roles belonging to an application.
- Assign roles to users.
- Update and remove user role assignments.
- Return role and assignment data to the client service.

## Tech Stack

- Node.js and Express 5
- Prisma and PostgreSQL
- JWT client authentication
- express-validator dependencies

## Prerequisites

- Node.js 18 or newer
- PostgreSQL, or the repository Docker Compose database
- A configured `.env` file

## Environment Variables

Create `rbac-service/.env` for local execution:

```env
PORT=8003
DATABASE_URL=postgresql://postgres:password@localhost:5432/rbac_db
JWT_CLIENT_SECRET=replace-with-a-client-secret
USER_SERVICE_URL=http://localhost:8001/api/AaaS/user/v1
TOKEN_SERVICE_URL=http://localhost:8002/api/AaaS/token/v1
```

Set URLs to the actual service locations in your environment.

## Local Setup

```sh
cd rbac-service
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

The API listens on `http://localhost:8003` with the example configuration. Use `npm start` for a normal process.

## Docker Compose

From the repository root, configure the root `.env`, then run:

```sh
docker compose up --build rbac-service
```

The container applies committed migrations with `prisma migrate deploy` before starting.

## API Prefixes

Role management routes use:

```text
/api/AaaS/rbac/v1
```

User-role routes use:

```text
/api/AaaS/rbac/user/v1
```

Typical operations include `/create/:id`, `/update/:roleId`, `/delete/:roleId`, `/all`, `/app/:appId`, and `/add/:roleId`. See `routers/` for the complete definitions.

## Project Structure

```text
app.js                 Express application and route mounting
server.js              HTTP server entry point
controllers/           Role and user-role handlers
middlewares/           Client authentication
routers/               Role and assignment routes
prisma/                Schema and migrations
utils/                 Database and response helpers
```

After schema changes, create and generate a migration with `npx prisma migrate dev --name describe-your-change` and `npx prisma generate`.
