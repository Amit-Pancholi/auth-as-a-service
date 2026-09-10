# Auth as a Service

Auth as a Service (AaaS) is a Node.js and PostgreSQL microservice platform that lets an application use authentication without implementing its own signup, login, logout, token, user-management, or role-management logic.

An application first registers with the client service. The service returns an application-specific URL/token pair. The application then sends authentication requests to the AaaS URL with that token. AaaS identifies the application, performs the authentication work, and returns the appropriate response. The application only needs to call the service endpoints and use the returned access tokens when it calls protected endpoints.

## How It Works

The main flow is:

1. A client registers and creates an application through the client service.
2. The client service creates an application access URL and unique token.
3. The client application sends signup and login requests to the user-service URL with the application token.
4. The user service validates the token, creates or authenticates the user, and asks the token service to create tokens.
5. The client application sends the returned access token with later protected requests.
6. The client service can manage applications, users, tokens, roles, and role assignments without exposing the internal service-to-service details to the client application.

JWT secrets are shared between the services that need to validate them. PostgreSQL stores the service data, and Prisma manages each service's schema and migrations.

## Services

### `client-service`

The management and integration API for applications using AaaS. It manages client accounts, registered applications, application secrets, application URL/token generation, users, tokens, roles, and role assignments. Its public API is mounted at `/api/AaaS/v1`.

### `User-service`

Owns user authentication and account data. It handles signup, login, logout, profile updates, account deletion, and administrative active/inactive/banned-user operations. Its API is mounted at `/api/AaaS/user/v1`.

### `Token-service`

Creates and manages access and refresh tokens for users and client applications. It also supports token lookup, update, and deletion. Its API is mounted at `/api/AaaS/token/v1`.

### `RBAC-service`

Provides role-based access control. It creates, updates, lists, and deletes application roles and assigns roles to users. Its APIs are mounted at `/api/AaaS/rbac/v1` and `/api/AaaS/rbac/user/v1`.

### `Frontend`

An Express and EJS server-rendered administration interface. It provides login, signup, dashboard, application, token, user, and role-management pages and calls the client service through `BACKEND_URL`.

### `Nginx`

The reverse proxy for the backend APIs. It routes the `/api/AaaS/...` paths to the appropriate internal service and exposes a `/health` endpoint when it is running.

## API Prefixes

When running services directly, the default prefixes are:

| Service  | Prefix               | Default port |
| -------- | -------------------- | -----------: |
| Client   | `/api/AaaS/v1`       |         8000 |
| User     | `/api/AaaS/user/v1`  |         8001 |
| Token    | `/api/AaaS/token/v1` |         8002 |
| RBAC     | `/api/AaaS/rbac/v1`  |         8003 |
| Frontend | `/`                  |         3000 |

Important user-facing operations include `POST /signup/:token`, `POST /login/:token`, and `POST /logout` on the user service. The client service includes application and management operations such as `/getUrlAndToken`, `/add`, `/all`, `/role/create`, and `/token/user`. Check the router files for request bodies, authentication middleware, and the complete route list.

## Run Without Docker

### Requirements

- Node.js 18 or newer
- npm
- PostgreSQL 15 or newer
- Nginx

Each backend service uses its own Prisma schema. You can use separate databases (`client_db`, `user_db`, `token_db`, and `rbac_db`) on the same PostgreSQL server, which is the recommended local setup.

### 1. Clone the repository

```sh
git clone <repository-url>
cd auth-as-a-service
```

### 2. Configure backend environment files

Create one `.env` file in each backend service directory. Replace the database credentials and secrets with values for your machine. The URLs must point to the ports where the other local services are running.

`client-service/.env`

```env
PORT=8000
DATABASE_URL=postgresql://postgres:password@localhost:5432/client_db
JWT_CLIENT_SECRET=replace-with-a-long-client-secret
JWT_URL_SECRET=replace-with-a-long-url-secret
USER_SERVICE_URL=http://localhost:8001/api/AaaS/user/v1
TOKEN_SERVICE_URL=http://localhost:8002/api/AaaS/token/v1
RBAC_SERVICE_URL=http://localhost:8003/api/AaaS/rbac/v1
USER_ACCESS=http://localhost:8001/api/AaaS/user/v1
```

`user-service/.env`

```env
PORT=8001
DATABASE_URL=postgresql://postgres:password@localhost:5432/user_db
JWT_CLIENT_SECRET=replace-with-the-same-client-secret
JWT_URL_SECRET=replace-with-the-same-url-secret
TOKEN_SERVICE_URL=http://localhost:8002/api/AaaS/token/v1
RBAC_SERVICE_URL=http://localhost:8003/api/AaaS/rbac/v1
```

`token-service/.env`

```env
PORT=8002
DATABASE_URL=postgresql://postgres:password@localhost:5432/token_db
JWT_CLIENT_SECRET=replace-with-the-same-client-secret
USER_SERVICE_URL=http://localhost:8001/api/AaaS/user/v1
RBAC_SERVICE_URL=http://localhost:8003/api/AaaS/rbac/v1
```

`rbac-service/.env`

```env
PORT=8003
DATABASE_URL=postgresql://postgres:password@localhost:5432/rbac_db
JWT_CLIENT_SECRET=replace-with-the-same-client-secret
USER_SERVICE_URL=http://localhost:8001/api/AaaS/user/v1
TOKEN_SERVICE_URL=http://localhost:8002/api/AaaS/token/v1
```

The `JWT_CLIENT_SECRET` value must match in every backend service. The `JWT_URL_SECRET` value must match in the client and user services. Do not commit real secrets or local `.env` files.

### 3. Install and prepare each backend service

Run the following once for each of `client-service`, `user-service`, `token-service`, and `rbac-service`:

```sh
cd <service-directory>
npm install
npx prisma generate
npx prisma migrate dev
```

`prisma migrate dev` creates or updates the tables in the database named by that service's `DATABASE_URL`. Run it from the relevant service directory.

### 4. Start the backend services

Open four terminal windows from the repository root:

```sh
cd client-service && npm run dev
```

```sh
cd user-service && npm run dev
```

```sh
cd token-service && npm run dev
```

```sh
cd rbac-service && npm run dev
```

Use `npm start` instead of `npm run dev` for a normal Node.js process.

### 5. Start Nginx

The frontend and external client applications must access the backend through Nginx. Nginx configuration uses Compose service names, so use nginx.local.conf when running without Docker.

Install Nginx using your operating system's package manager, then start it from the repository root:

```sh
nginx -t -c "$PWD/nginx/nginx.local.conf" -p "$PWD/nginx/"
nginx -c "$PWD/nginx/nginx.local.conf" -p "$PWD/nginx/"
```

Stop it with:

```sh
nginx -c "$PWD/nginx/nginx.local.conf" -p "$PWD/nginx/" -s quit
```

### 6. Start the frontend

Create `frontend/.env`:

```env
PORT=3000
BACKEND_URL=http://localhost                         # according to nginx config
SESSION_SECRET=replace-with-a-long-random-session-secret
```

Then run:

```sh
cd frontend
npm install
npm run build:css
npm run dev
```

Open <http://localhost:3000>. The frontend uses the backend service at `BACKEND_URL`. 
## Run With Docker Compose

### Requirements

- Docker Engine
- Docker Compose v2 (`docker compose`)

### Configure the root `.env`

Create `.env` in the repository root. Compose uses these values to configure PostgreSQL and the backend containers:

```env
POSTGRES_USER=aaas
POSTGRES_PASSWORD=change-this-password
POSTGRES_DB=auth_as_a_service

NGINX_PORT=8099
CLIENT_PORT=8000
USER_PORT=8001
TOKEN_PORT=8002
RBAC_PORT=8003
FRONTEND_PORT=3000

CLIENT_DATABASE_URL=postgresql://aaas:change-this-password@local_postgres:5432/auth_as_a_service?schema=client_schema
USER_DATABASE_URL=postgresql://aaas:change-this-password@local_postgres:5432/auth_as_a_service?schema=user_schema
TOKEN_DATABASE_URL=postgresql://aaas:change-this-password@local_postgres:5432/auth_as_a_service?schema=token_schema
RBAC_DATABASE_URL=postgresql://aaas:change-this-password@local_postgres:5432/auth_as_a_service?schema=rbac_schema

JWT_CLIENT_SECRET=replace-with-a-long-client-secret
JWT_URL_SECRET=replace-with-a-long-url-secret
# Used by the Docker frontend to reach Nginx inside the Compose network.
BACKEND_URL=http://nginx-server
# Public URL returned to client applications outside Docker.
USER_ACCESS=http://localhost:8099
SESSION_SECRET=replace-with-a-long-random-session-secret
```

All four backend services use the `auth_as_a_service` database with a separate PostgreSQL schema. The Compose PostgreSQL volume initializes the database from `POSTGRES_DB`; no extra database-creation commands are required. Keep the username and password in each connection URL consistent with `POSTGRES_USER` and `POSTGRES_PASSWORD`.

### Start the backend containers

After the root `.env` is configured, start the backend containers from the repository root:

```sh
docker compose up --build client-service user-service token-service rbac-service
```

The backend images install dependencies, generate Prisma clients, apply committed migrations with `prisma migrate deploy`, and start their servers. The containers communicate with one another using Compose service names such as `http://user-service:8001`.

To stop them:

```sh
docker compose down
```

Add `-v` only when you intentionally want to delete the PostgreSQL Compose volume and all local database data.

### Docker URLs and traffic flow

The current Compose file includes Dockerfiles for all services and publishes both the frontend and Nginx. With the sample values above:

- Frontend: `http://localhost:3000`
- app auth connect through Nginx: `http://localhost:8099`

The Docker frontend uses `BACKEND_URL=http://nginx-server` for its server-side requests. 
Service will provide auth to other apps through `USER_ACCESS=http://localhost:8099` in generated application URLs, allowing an external client application to send signup and login requests through the host-published Nginx port.

The frontend health route is implemented at `/health`, so its Docker healthcheck is supported. 

Start the complete stack with:

```sh
docker compose up --build
```

## Development Notes

Each backend service has its own `app.js`, server entrypoint, controllers, routers, middleware, Prisma schema, and migrations. After changing a schema, create a named migration and regenerate the client:

```sh
npx prisma migrate dev --name describe-your-change
npx prisma generate
```

The repository also contains `ROUTE_CHECKLIST.md`, which can be used to verify route wiring, middleware, authorization, and responses while developing.

## Contributing

1. Fork the repository.
2. Create a focused feature branch.
3. Add or update documentation and tests for behavior you change.
4. Run the affected services and Prisma checks locally.
5. Commit your changes and open a pull request describing the change.

Please do not commit passwords, JWT secrets, session secrets, generated credentials, or local `.env` files.

## Developer

**Amit Kumar Pancholi**

- GitHub: <https://github.com/Amit-Pancholi>
- Email: <amitjipancholi@gmail.com>

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).