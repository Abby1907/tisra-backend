import { Response, NextFunction } from 'express';
import { UserService } from '../../services/user';
import { ApiResponse, AuthenticatedRequest } from '../../types/common.types';
import { UpdateProfileInput } from '../../types/user.types';

export class UserController {
  static async getProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await UserService.getProfile(req.user!.id);
      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: result,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await UserService.updateProfile(req.user!.id, req.body as UpdateProfileInput);
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: result,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }
}
