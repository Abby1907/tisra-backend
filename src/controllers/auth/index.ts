import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../services/auth';
import { ApiResponse } from '../../types/common.types';
import { RegisterInput, LoginInput, RefreshTokenInput } from '../../types/auth.types';
import { accessTokenCookieConfig, refreshTokenCookieConfig } from '../../config/cookie';

export class AuthController {
  static async register(
    req: Request<unknown, unknown, RegisterInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await AuthService.register(req.body);

      // Set cookies
      res.cookie('accessToken', result.tokens.accessToken, accessTokenCookieConfig);
      res.cookie('refreshToken', result.tokens.refreshToken, refreshTokenCookieConfig);

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: result,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  static async login(
    req: Request<unknown, unknown, LoginInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await AuthService.login(req.body);

      // Set cookies
      res.cookie('accessToken', result.tokens.accessToken, accessTokenCookieConfig);
      res.cookie('refreshToken', result.tokens.refreshToken, refreshTokenCookieConfig);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(
    req: Request<unknown, unknown, RefreshTokenInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const refreshToken = req.body.refreshToken || req.cookies.refreshToken;
      const result = await AuthService.refreshToken(refreshToken);

      // Set cookies
      res.cookie('accessToken', result.accessToken, accessTokenCookieConfig);
      res.cookie('refreshToken', result.refreshToken, refreshTokenCookieConfig);

      res.status(200).json({
        success: true,
        message: 'Token refreshed',
        data: result,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  static async logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await AuthService.logout();

      // Clear cookies
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }
}
