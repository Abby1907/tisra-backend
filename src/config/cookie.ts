import { CookieOptions } from 'express';
import { env } from './env';

export const cookieConfig: CookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (matching refresh token default)
};

export const accessTokenCookieConfig: CookieOptions = {
  ...cookieConfig,
  maxAge: 15 * 60 * 1000, // 15 minutes (matching access token default)
};

export const refreshTokenCookieConfig: CookieOptions = {
  ...cookieConfig,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
