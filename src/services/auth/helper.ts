import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { JwtPayload, AuthTokens } from '../../types/auth.types';

export class AuthHelper {
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateTokens(payload: JwtPayload): AuthTokens {
    const accessToken = jwt.sign(payload, env.jwt.accessSecret, {
      expiresIn: env.jwt.accessExpiry as jwt.SignOptions['expiresIn'],
    });

    const refreshToken = jwt.sign(payload, env.jwt.refreshSecret, {
      expiresIn: env.jwt.refreshExpiry as jwt.SignOptions['expiresIn'],
    });

    return { accessToken, refreshToken };
  }

  static verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, env.jwt.accessSecret) as JwtPayload;
  }

  static verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, env.jwt.refreshSecret) as JwtPayload;
  }
}
