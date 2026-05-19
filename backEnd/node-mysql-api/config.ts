import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

function requireEnv(key: string, fallback?: string) {
  const value = process.env[key];
  if (value !== undefined) {
    return value;
  }

  if (!isProduction && fallback !== undefined) {
    return fallback;
  }

  throw new Error(`Missing required environment variable: ${key}`);
}

function getNumberEnv(key: string, fallback: number) {
  const value = process.env[key];
  return value ? Number(value) : fallback;
}

export default {
  env: nodeEnv,
  isProduction,
  port: getNumberEnv('PORT', 4000),
  corsOrigin: process.env.CORS_ORIGIN || (!isProduction ? 'http://localhost:4200' : ''),
  jwtSecret: requireEnv('JWT_SECRET', 'SUPER_SECRET_CHANGE_ME'),
  cookieSecure: process.env.COOKIE_SECURE === 'true' || isProduction,
  cookieSameSite: (process.env.COOKIE_SAMESITE as any) || (isProduction ? 'none' : 'lax'),
  db: {
    host: requireEnv('DB_HOST', 'localhost'),
    port: getNumberEnv('DB_PORT', 3306),
    user: requireEnv('DB_USER', 'root'),
    password: requireEnv('DB_PASSWORD', ''),
    database: requireEnv('DB_NAME', 'app_db'),
    ssl: process.env.DB_SSL === 'true'
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: getNumberEnv('SMTP_PORT', 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASSWORD || ''
    }
  },
  emailFrom: process.env.EMAIL_FROM || 'no-reply@example.com',
  sendGridApiKey: process.env.SENDGRID_API_KEY || ''
};
