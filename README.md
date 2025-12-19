# WedSync Backend

Backend API server for WedSync wedding app using Better Auth.

## Quick Start

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env and add your DATABASE_URL and BETTER_AUTH_SECRET
   ```

3. **Generate Prisma client:**
   ```bash
   bunx prisma generate
   ```

4. **Push schema to database:**
   ```bash
   bunx prisma db push
   ```

5. **Start development server:**
   ```bash
   bun run dev
   ```

Server will be running at http://localhost:3000

## Endpoints

- `GET /health` - Health check
- `POST /api/auth/sign-up/email` - Create new account
- `POST /api/auth/sign-in/email` - Sign in
- `POST /api/auth/sign-out` - Sign out
- `GET /api/me` - Get current user (protected)

## Deployment

See `AUTHENTICATION_SETUP_GUIDE.md` in the root directory for full deployment instructions.
