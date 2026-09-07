# Token Service Setup

The token service creates, reads, updates, and deletes authentication tokens for users and client applications. It is an internal API used by the other services.

## Responsibilities

- Generate tokens for users and clients.
- List tokens by client or application.
- Update user and client tokens.
- Delete tokens by user, client, or token ID.
- Protect client and user token operations with JWT middleware.

## Tech Stack

- Node.js and Express 5
- Prisma and PostgreSQL
- JSON Web Tokens
- express-validator dependencies

## Prerequisites

- Node.js 18 or newer
- PostgreSQL, or the repository Docker Compose database
- A configured `.env` file

## Environment Variables

Create `token-service/.env` for local execution:

```env
PORT=8002
DATABASE_URL=postgresql://postgres:password@localhost:5432/token_db
JWT_CLIENT_SECRET=replace-with-a-client-secret
USER_SERVICE_URL=http://localhost:8001/api/AaaS/user/v1
RBAC_SERVICE_URL=http://localhost:8003/api/AaaS/rbac/v1
```

Set URLs to the actual service locations in your environment.

## Local Setup

```sh
cd token-service
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

The API listens on `http://localhost:8002` with the example configuration. Use `npm start` for a normal process.

## Docker Compose

From the repository root, configure the root `.env`, then run:

```sh
docker compose up --build token-service
```

The container applies committed migrations with `prisma migrate deploy` before starting.

## API Prefix

All routes are mounted under:

```text
/api/AaaS/token/v1
```

The main operations include `/user`, `/client`, `/client/:clientId`, `/app/:appId`, `/by-user`, `/by-client/:tokenId`, and `/client`. See `routers/manage-router.js` for middleware requirements and the complete route list.

## Project Structure

```text
app.js                 Express application and route mounting
server.js              HTTP server entry point
controllers/           Token handlers
middlewares/           Client and user authentication
routers/               Token routes
prisma/                Schema and migrations
utils/                 Database and response helpers
```

After schema changes, create and generate a migration with `npx prisma migrate dev --name describe-your-change` and `npx prisma generate`.
