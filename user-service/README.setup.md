# User Service Setup

The user service owns user authentication and user account operations. It handles signup, login, logout, profile changes, and administrative user management.

## Responsibilities

- Sign users up and authenticate them.
- Log users out and invalidate their tokens.
- Update and delete user accounts.
- List active, inactive, and banned users.
- Ban and unban users for authorized clients.
- Communicate with the token and RBAC services.

## Tech Stack

- Node.js and Express 5
- Prisma and PostgreSQL
- JWT and bcrypt/bcryptjs
- express-validator dependencies

## Prerequisites

- Node.js 18 or newer
- PostgreSQL, or the repository Docker Compose database
- A configured `.env` file

## Environment Variables

Create `user-service/.env` for local execution:

```env
PORT=8001
DATABASE_URL=postgresql://postgres:password@localhost:5432/user_db
JWT_CLIENT_SECRET=replace-with-a-client-secret
JWT_URL_SECRET=replace-with-a-url-secret
TOKEN_SERVICE_URL=http://localhost:8002/api/AaaS/token/v1
RBAC_SERVICE_URL=http://localhost:8003/api/AaaS/rbac/v1
```

Set URLs to the actual service locations in your environment.

## Local Setup

```sh
cd user-service
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

The API listens on `http://localhost:8001` with the example configuration. Use `npm start` for a normal process.

## Docker Compose

From the repository root, configure the root `.env`, then run:

```sh
docker compose up --build user-service
```

The container applies committed migrations with `prisma migrate deploy` before starting.

## API Prefixes

Authentication routes are mounted under:

```text
/api/AaaS/user/v1
```

Authentication operations include `POST /signup/:token`, `POST /login/:token`, and `POST /logout`.

Management operations include `POST /update/:token`, `POST /delete/:token`, `POST /ban`, `POST /unban`, `GET /all`, `GET /active`, `GET /inactive`, and `GET /banned`.

See `routers/` for middleware requirements and the complete route definitions.

## Project Structure

```text
app.js                 Express application and route mounting
server.js              HTTP server entry point
controllers/           Authentication and account handlers
middlewares/           JWT, access, and update middleware
routers/               Authentication and management routes
prisma/                Schema and migrations
utils/                 Database and response helpers
```

After schema changes, create and generate a migration with `npx prisma migrate dev --name describe-your-change` and `npx prisma generate`.
