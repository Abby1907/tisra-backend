import { User } from '@prisma/client';

export type UserProfile = Omit<User, 'passwordHash'>;

export interface UpdateProfileInput {
  displayName?: string;
  avatarUrl?: string;
}
