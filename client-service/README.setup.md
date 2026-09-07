# Client Service Setup

The client service is the management API for applications that use this authentication platform. It manages client applications, application secrets, users, roles, role assignments, and token administration.

## Responsibilities

- Create and manage client applications.
- Create URL and access tokens for client applications.
- Manage active, inactive, and banned users.
- Manage roles and role assignments.
- Communicate with the user, token, and RBAC services.

## Tech Stack

- Node.js and Express 5
- Prisma and PostgreSQL
- JWT, bcryptjs, and express-validator
- Jest and Supertest dependencies are included for testing

## Prerequisites

- Node.js 18 or newer
- PostgreSQL, or the repository Docker Compose database
- A configured `.env` file

## Environment Variables

Create `client-service/.env` when running this service outside Docker:

```env
PORT=8000
DATABASE_URL=postgresql://postgres:password@localhost:5432/client_db
JWT_CLIENT_SECRET=replace-with-a-client-secret
JWT_URL_SECRET=replace-with-a-url-secret
USER_SERVICE_URL=http://localhost:8001/api/AaaS/user/v1
TOKEN_SERVICE_URL=http://localhost:8002/api/AaaS/token/v1
RBAC_SERVICE_URL=http://localhost:8003/api/AaaS/rbac/v1
USER_ACCESS=http://localhost:8001/api/AaaS/user/v1
```

Use the actual ports and database names from your local environment. The service reads its database connection from `DATABASE_URL`.

## Local Setup

```sh
cd client-service
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

The API listens on the value of `PORT`. For the example above, open `http://localhost:8000`.

Use `npm start` for a normal Node.js process.

## Docker Compose

From the repository root, configure the root `.env` file expected by `docker-compose.yml`, then run:

```sh
docker compose up --build client-service
```

The container runs `prisma migrate deploy` before starting the server.

## API Prefixes

All routes are mounted under:

```text
/api/AaaS/v1
```

Examples include `/add`, `/all`, `/user/all`, `/role/create`, and `/token/user`. Inspect `routers/manage-routes.js` for the complete route list.

## Project Structure

```text
app.js                 Express application and route mounting
server.js              HTTP server entry point
controllers/           Client and management handlers
middlewares/           Authentication middleware
routers/               API route definitions
prisma/                Schema and database migrations
utils/                 Database and response helpers
```

## Database Changes

After changing `prisma/schema.prisma`, create a migration during development:

```sh
npx prisma migrate dev --name describe-your-change
npx prisma generate
```

Do not commit secrets. Keep local environment files out of version control.

## Existing Documentation

The original `README.md` in this folder is preserved. This file is an additional setup guide.
