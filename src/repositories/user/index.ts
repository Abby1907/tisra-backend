import { User, Prisma } from '@prisma/client';
import { prisma } from '../../config/database';

export class UserRepository {
  static async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  static async findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { username } });
  }

  static async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  static async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }

  static async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }
}
