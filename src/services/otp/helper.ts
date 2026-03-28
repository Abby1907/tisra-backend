import nodemailer from 'nodemailer';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

export class OtpHelper {
  private static transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass,
    },
  });

  static generateOtpCode(length: number = 6): string {
    const digits = '0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return code;
  }

  static async sendOtpEmail(email: string, code: string): Promise<void> {
    try {
      const mailOptions = {
        from: env.emailFrom,
        to: email,
        subject: 'Your Tisra OTP Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #4CAF50; text-align: center;">Tisra Email Verification</h2>
            <p>Hello,</p>
            <p>Your One-Time Password (OTP) for Tisra is:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333; background: #f4f4f4; padding: 10px 20px; border-radius: 5px;">${code}</span>
            </div>
            <p>This code is valid for **10 minutes**. Please do not share it with anyone.</p>
            <p>If you did not request this code, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #888; text-align: center;">&copy; 2026 Tisra Inc. All rights reserved.</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`OTP sent to email: ${email}`);
    } catch (error) {
      logger.error('Failed to send OTP email:', error);
      throw new Error('Could not send OTP email. Please try again later.');
    }
  }

  static async sendOtpSms(phone: string, code: string): Promise<void> {
    // Mock implementation as per requirements
    logger.info(`[MOCK SMS] Sending OTP ${code} to phone ${phone}`);
    return Promise.resolve();
  }
}
