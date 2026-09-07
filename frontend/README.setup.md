# Frontend Setup

The frontend is the server-rendered web application for Auth as a Service. It uses Express and EJS to provide login, signup, dashboard, application, token, user, and role-management pages.

## Responsibilities

- Render the web interface with EJS templates.
- Handle browser sessions and cookies.
- Send authenticated requests to the client service.
- Provide dashboard pages for applications, tokens, users, and roles.

## Tech Stack

- Node.js and Express 5
- EJS templates
- Express sessions and cookies
- Tailwind CSS via the Tailwind CLI

## Prerequisites

- Node.js 18 or newer
- The client service running and reachable
- A configured `.env` file

## Environment Variables

Create `frontend/.env`:

```env
PORT=3000
BACKEND_URL=http://localhost:8000
SESSION_SECRET=replace-with-a-long-random-value
```

`BACKEND_URL` defaults to `http://localhost:8000` when it is not provided. Use the client service URL that matches your local setup.

## Local Setup

```sh
cd frontend
npm install
npm run build:css
npm run dev
```

Open `http://localhost:3000` in a browser. Use `npm start` for a normal Node.js process.

When editing Tailwind input styles in another terminal, run:

```sh
npm run watch:css
```

## Pages and Routes

- `/login` and `/signup`: authentication pages
- `/dashboard`: dashboard home
- `/dashboard/apps`: client applications
- `/dashboard/tokens`: token management
- `/dashboard/users`: user management
- `/dashboard/roles`: role management
- `/logout`: ends the web session

## Project Structure

```text
app.js                 Express setup and route mounting
server.js              HTTP server entry point
controllers/           Page and form handlers
middleware/            Session authentication
routers/               Browser route definitions
views/                 EJS templates
public/                Compiled CSS and static assets
src/input.css          Tailwind source stylesheet
utils/                 Shared path helpers
```

## Docker Note

The current root `docker-compose.yml` does not define a frontend container, and this folder does not contain a `Dockerfile`. Run the frontend locally while the backend services run locally or through Docker Compose.

Do not commit secrets. Keep local environment files out of version control.
