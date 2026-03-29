# Admin Project Server

A simple Node.js/Express backend starter for an admin system.

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the example env file and update values:

   ```bash
   cp .env.example .env
   ```

3. Run in development mode (auto-restarts on changes):

   ```bash
   npm run dev
   ```

4. Production start:

   ```bash
   npm start
   ```

## Endpoints

- `GET /health` - healthcheck endpoint

### Auth

- `POST /api/auth/login` - authenticate and receive JWT token
  - Body: `{ "username": "...", "password": "...", "rememberMe": true }`
  - `rememberMe` (optional) extends token expiration (e.g. 7 days)
- `POST /api/auth/refresh` - refresh JWT token (requires the current token in `Authorization` header)

### Users (requires JWT token)

- `GET /api/users/me` - current user profile
- `GET /api/users` - list all users (admin only)
- `POST /api/users` - create a new user (admin only)

## Extend

- Add routes under `src/`
- Add middleware for auth, logging, etc.
- Connect to a database and add models

## Admin user seeding

If you set `ADMIN_USER` and `ADMIN_PASSWORD` in your `.env`, the server will automatically create an admin account on first startup (only if it does not already exist).

Example `.env`:

```env
ADMIN_USER=admin
ADMIN_PASSWORD=securePass123
```
