/**
 * ดาวเทวา — Environment Configuration
 * All environment variables are accessed here.
 * Never import process.env directly elsewhere.
 */

export const ENV = {
  CLAUDE_API_KEY: process.env.CLAUDE_API_KEY || '',
  CLAUDE_MODEL: 'claude-sonnet-4-6',
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000',
  REVENUECAT_API_KEY_IOS: process.env.REVENUECAT_IOS || '',
  REVENUECAT_API_KEY_ANDROID: process.env.REVENUECAT_ANDROID || '',
  APP_ENV: (process.env.APP_ENV || 'development') as 'development' | 'staging' | 'production',
} as const;

export type AppEnv = typeof ENV.APP_ENV;
