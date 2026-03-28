import { Request, Response, NextFunction } from 'express';
import { OtpService } from '../../services/otp';
import { ApiResponse } from '../../types/common.types';
import { OtpRequest, OtpVerifyInput } from '../../types/otp.types';

export class OtpController {
  static async requestOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await OtpService.requestOtp(req.body as OtpRequest);
      res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  static async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await OtpService.verifyOtp(req.body as OtpVerifyInput);
      res.status(200).json({
        success: true,
        message: result.message,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }
}
