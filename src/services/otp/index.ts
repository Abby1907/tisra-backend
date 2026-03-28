import { OtpRepository } from '../../repositories/otp';
import { OtpHelper } from './helper';
import { OtpRequest, OtpVerifyInput, OtpVerifyOutput } from '../../types/otp.types';
import { BadRequestError, ValidationError } from '../../errors';

export class OtpService {
  static async requestOtp(data: OtpRequest): Promise<void> {
    const { identifier, type } = data;
    const code = OtpHelper.generateOtpCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Save to database
    await OtpRepository.create({
      identifier,
      code,
      expiresAt,
    });

    // Send OTP via email or SMS
    if (type === 'email') {
      await OtpHelper.sendOtpEmail(identifier, code);
    } else {
      await OtpHelper.sendOtpSms(identifier, code);
    }
  }

  static async verifyOtp(data: OtpVerifyInput): Promise<OtpVerifyOutput> {
    const { identifier, code } = data;

    const otp = await OtpRepository.findValidByCode(identifier, code);

    if (!otp) {
      // Find any recent OTP for this identifier to increment attempts
      // In a real-world scenario, you might want more complex tracking
      throw new BadRequestError('Invalid or expired OTP code');
    }

    // Invalidate OTP after successful verification
    await OtpRepository.invalidate(otp.id);

    return {
      success: true,
      message: 'OTP verified successfully',
    };
  }

  static async validateOtpBeforeAction(identifier: string, code: string): Promise<void> {
    const otp = await OtpRepository.findValidByCode(identifier, code);

    if (!otp) {
      throw new ValidationError('Invalid or expired OTP code');
    }

    // Mark as used/delete
    await OtpRepository.invalidate(otp.id);
  }
}
