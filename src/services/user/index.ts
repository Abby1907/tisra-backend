import { UserRepository } from '../../repositories/user';
import { UserProfile, UpdateProfileInput } from '../../types/user.types';
import { NotFoundError } from '../../errors';

export class UserService {
  static async getProfile(userId: string): Promise<UserProfile> {
    const user = await UserRepository.findById(userId);
    if (!user) throw new NotFoundError('User');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...profile } = user;
    return profile;
  }

  static async updateProfile(userId: string, data: UpdateProfileInput): Promise<UserProfile> {
    // Verify user exists
    const user = await UserRepository.findById(userId);
    if (!user) throw new NotFoundError('User');

    const updatedUser = await UserRepository.update(userId, data);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...profile } = updatedUser;
    return profile;
  }
}
