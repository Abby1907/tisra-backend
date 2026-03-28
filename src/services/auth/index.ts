import { UserRepository } from '../../repositories/user';
import { AuthHelper } from './helper';
import {
  RegisterInput,
  RegisterOutput,
  LoginInput,
  LoginOutput,
  AuthTokens,
} from '../../types/auth.types';
import { ConflictError, UnauthorizedError, ValidationError } from '../../errors';
import { OtpService } from '../otp';

export class AuthService {
  static async register(data: RegisterInput): Promise<RegisterOutput> {
    const { email, username, password, displayName } = data;

    // Check if user exists
    const existingEmail = await UserRepository.findByEmail(email);
    if (existingEmail) throw new ConflictError('Email already registered');

    const existingUsername = await UserRepository.findByUsername(username);
    if (existingUsername) throw new ConflictError('Username already taken');

    // Hash password
    const passwordHash = await AuthHelper.hashPassword(password);

    // Create user
    const user = await UserRepository.create({
      email,
      username,
      passwordHash,
      displayName,
    });

    // Generate tokens
    const tokens = AuthHelper.generateTokens({
      id: user.id,
      email: user.email,
      username: user.username,
    });

    // Request OTP for email verification
    await OtpService.requestOtp({ identifier: email, type: 'email' });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, tokens };
  }

  static async login(data: LoginInput): Promise<LoginOutput> {
    const { email, username, password } = data;

    // Find user
    const user = email
      ? await UserRepository.findByEmail(email)
      : await UserRepository.findByUsername(username!);

    if (!user) throw new UnauthorizedError('Invalid credentials');

    // Compare password
    const isPasswordMatch = await AuthHelper.comparePassword(password, user.passwordHash);
    if (!isPasswordMatch) throw new UnauthorizedError('Invalid credentials');

    // Check if verified
    if (!user.isVerified) {
      // Re-send OTP if not verified
      await OtpService.requestOtp({ identifier: user.email, type: 'email' });
      throw new UnauthorizedError('Please verify your email to login. A new OTP has been sent.');
    }

    // Generate tokens
    const tokens = AuthHelper.generateTokens({
      id: user.id,
      email: user.email,
      username: user.username,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, tokens };
  }

  static async refreshToken(token: string): Promise<AuthTokens> {
    try {
      const payload = AuthHelper.verifyRefreshToken(token);

      // Verify user still exists
      const user = await UserRepository.findById(payload.id);
      if (!user) throw new UnauthorizedError('User no longer exists');

      // Generate new tokens
      return AuthHelper.generateTokens({
        id: user.id,
        email: user.email,
        username: user.username,
      });
    } catch (error) {
      throw new UnauthorizedError('Invalid refresh token');
    }
  }

  static async logout(_token?: string): Promise<void> {
    return Promise.resolve();
  }

  static async verifyEmail(email: string, code: string): Promise<void> {
    await OtpService.validateOtpBeforeAction(email, code);

    const user = await UserRepository.findByEmail(email);
    if (!user) throw new ValidationError('User not found');

    await UserRepository.update(user.id, { isVerified: true });
  }

  static async forgotPassword(identifier: string): Promise<void> {
    const user = await UserRepository.findByEmail(identifier);
    if (!user) return;

    await OtpService.requestOtp({ identifier: user.email, type: 'email' });
  }

  static async resetPassword(identifier: string, code: string, password: string): Promise<void> {
    await OtpService.validateOtpBeforeAction(identifier, code);

    const user = await UserRepository.findByEmail(identifier);
    if (!user) throw new ValidationError('User not found');

    const passwordHash = await AuthHelper.hashPassword(password);
    await UserRepository.update(user.id, { passwordHash });
  }

  static async getCurrentUser(userId: string): Promise<any> {
    const user = await UserRepository.findById(userId);
    if (!user) throw new UnauthorizedError('User not found');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
