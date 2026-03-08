export function getEnv(key: string, fallback?: string): string {
  const v = process.env[key];
  if (v && v.trim().length > 0) return v;
  if (fallback !== undefined) return fallback;
  throw new Error(`Missing required env: ${key}`);
}

export const ENV = {
  APP_URL: process.env.APP_URL || 'http://localhost:3000',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change',
  ACTIVATION_SECRET: process.env.ACTIVATION_SECRET || 'dev-activation-change',
  DB_URL: process.env.DATABASE_URL || process.env.DB_URL || '',
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  MAIL_FROM: process.env.MAIL_FROM || 'no-reply@example.com',
  KIWIFY_WEBHOOK_SECRET: process.env.KIWIFY_WEBHOOK_SECRET || '',
  RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX || '100'),
  RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
};
