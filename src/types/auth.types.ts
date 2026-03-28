import { User } from '@prisma/client';

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
  displayName: string;
}

export interface LoginInput {
  email?: string;
  username?: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  id: string;
  email: string;
  username: string;
}

export interface RegisterOutput {
  user: Omit<User, 'passwordHash'>;
  tokens: AuthTokens;
}

export interface LoginOutput extends RegisterOutput {}

export interface RefreshTokenInput {
  refreshToken: string;
}
