import { prisma } from '../../config/database';
import { Playlist } from '@prisma/client';
import { CreatePlaylistInput, PlaylistWithTracks } from '../../types/playlist.types';

export class PlaylistRepository {
  static async create(userId: string, data: CreatePlaylistInput): Promise<Playlist> {
    return prisma.playlist.create({
      data: {
        name: data.name,
        userId,
      },
    });
  }

  static async findAllByUserId(userId: string): Promise<Playlist[]> {
    return prisma.playlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async findById(id: string): Promise<PlaylistWithTracks | null> {
    return prisma.playlist.findUnique({
      where: { id },
      include: {
        tracks: {
          orderBy: { addedAt: 'asc' },
        },
      },
    });
  }

  static async update(id: string, name: string): Promise<Playlist> {
    return prisma.playlist.update({
      where: { id },
      data: { name },
    });
  }

  static async delete(id: string): Promise<void> {
    await prisma.playlist.delete({
      where: { id },
    });
  }
}
