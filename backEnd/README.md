Node.js, TypeScript & MySQL Boilerplate API

This backend is configured for deployment on Render with an online MySQL database.

Setup:
- Copy `.env.example` to `.env` locally for development.
- Use environment variables on Render instead of `.env` in production.
- Run `npm install` and `npm run build` before deployment.

Key files:
- `server.ts` — server startup, CORS config, route registration.
- `config.ts` — environment configuration loader.
- `src/_helpers/db.ts` — MySQL / Sequelize initialization.
- `src/accounts/controller.ts` — auth and cookie security.

Render environment variables:
- `PORT` (optional; Render provides one automatically)
- `JWT_SECRET`
- `FRONTEND_URL` (your Vercel frontend URL)
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_DATABASE`
- `DB_SSL` (true/false)
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE` (true/false)
- `SMTP_USER`
- `SMTP_PASSWORD`
- `EMAIL_FROM`

Frontend integration:
- The Angular frontend should call the deployed Render backend URL.
- Use environment-specific Angular `environment.ts` and `environment.prod.ts` files.
- If using cookies for refresh token auth, enable `withCredentials: true` on frontend requests.

Note: the Angular source is not present in this workspace, so frontend URL replacement should be done in the Angular project repository.
 