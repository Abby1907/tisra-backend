import { Response, NextFunction } from 'express';
import { AuthHelper } from '../services/auth/helper';
import { AuthenticatedRequest } from '../types/common.types';
import { UnauthorizedError } from '../errors';

export const authMiddleware = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token = '';
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new UnauthorizedError('No authentication token provided');
    }

    const payload = AuthHelper.verifyAccessToken(token);

    req.user = {
      id: payload.id,
      email: payload.email,
      username: payload.username,
    };

    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired access token'));
  }
};
