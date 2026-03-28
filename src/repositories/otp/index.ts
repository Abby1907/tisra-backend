import { PrismaClient, Otp } from '@prisma/client';
import { prisma } from '../../config/database';

export class OtpRepository {
  private static client: PrismaClient = prisma;

  static async create(data: { identifier: string; code: string; expiresAt: Date }): Promise<Otp> {
    return this.client.otp.create({
      data,
    });
  }

  static async findValidByCode(identifier: string, code: string): Promise<Otp | null> {
    const now = new Date();
    return this.client.otp.findFirst({
      where: {
        identifier,
        code,
        expiresAt: {
          gt: now,
        },
        attempts: {
          lt: 3,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async incrementAttempts(id: string): Promise<Otp> {
    return this.client.otp.update({
      where: { id },
      data: {
        attempts: {
          increment: 1,
        },
      },
    });
  }

  static async invalidate(id: string): Promise<void> {
    await this.client.otp.delete({
      where: { id },
    });
  }

  static async deleteExpired(): Promise<number> {
    const now = new Date();
    const result = await this.client.otp.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });
    return result.count;
  }
}
