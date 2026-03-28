import { prisma } from '../../config/database';
import { PlaylistTrack } from '@prisma/client';
import { AddTrackInput } from '../../types/playlist.types';

export class PlaylistTrackRepository {
  static async add(playlistId: string, data: AddTrackInput): Promise<PlaylistTrack> {
    return prisma.playlistTrack.create({
      data: {
        playlistId,
        ...data,
      },
    });
  }

  static async remove(playlistId: string, spotifyTrackId: string): Promise<void> {
    await prisma.playlistTrack.delete({
      where: {
        playlistId_spotifyTrackId: {
          playlistId,
          spotifyTrackId,
        },
      },
    });
  }

  static async exists(playlistId: string, spotifyTrackId: string): Promise<boolean> {
    const track = await prisma.playlistTrack.findUnique({
      where: {
        playlistId_spotifyTrackId: {
          playlistId,
          spotifyTrackId,
        },
      },
    });
    return !!track;
  }
}
