import { PlaylistRepository } from '../../repositories/playlist';
import { PlaylistTrackRepository } from '../../repositories/playlist-track';
import { PlaylistDetails, CreatePlaylistInput, AddTrackInput } from '../../types/playlist.types';
import { NotFoundError, ForbiddenError, ConflictError } from '../../errors';
import { Playlist } from '@prisma/client';

export class PlaylistService {
  static async createPlaylist(userId: string, data: CreatePlaylistInput): Promise<PlaylistDetails> {
    const playlist = await PlaylistRepository.create(userId, data);
    return this.getPlaylistDetails(playlist.id, userId);
  }

  static async getPlaylists(userId: string): Promise<Playlist[]> {
    return PlaylistRepository.findAllByUserId(userId);
  }

  static async getPlaylistDetails(id: string, userId: string): Promise<PlaylistDetails> {
    const playlist = await PlaylistRepository.findById(id);

    if (!playlist) throw new NotFoundError('Playlist');
    if (playlist.userId !== userId) throw new ForbiddenError('Access denied to this playlist');

    return {
      id: playlist.id,
      name: playlist.name,
      userId: playlist.userId,
      tracks: playlist.tracks.map((t) => ({
        id: t.id,
        spotifyTrackId: t.spotifyTrackId,
        trackName: t.trackName,
        artistName: t.artistName,
        albumArt: t.albumArt,
        durationMs: t.durationMs,
        addedAt: t.addedAt,
      })),
      createdAt: playlist.createdAt,
      updatedAt: playlist.updatedAt,
    };
  }

  static async updatePlaylist(id: string, userId: string, name: string): Promise<PlaylistDetails> {
    const playlist = await PlaylistRepository.findById(id);
    if (!playlist) throw new NotFoundError('Playlist');
    if (playlist.userId !== userId) throw new ForbiddenError('Access denied to this playlist');

    await PlaylistRepository.update(id, name);
    return this.getPlaylistDetails(id, userId);
  }

  static async deletePlaylist(id: string, userId: string): Promise<void> {
    const playlist = await PlaylistRepository.findById(id);
    if (!playlist) throw new NotFoundError('Playlist');
    if (playlist.userId !== userId) throw new ForbiddenError('Access denied to this playlist');

    await PlaylistRepository.delete(id);
  }

  static async addTrack(id: string, userId: string, data: AddTrackInput): Promise<PlaylistDetails> {
    const playlist = await PlaylistRepository.findById(id);
    if (!playlist) throw new NotFoundError('Playlist');
    if (playlist.userId !== userId) throw new ForbiddenError('Access denied to this playlist');

    const trackExists = await PlaylistTrackRepository.exists(id, data.spotifyTrackId);
    if (trackExists) throw new ConflictError('Track already in playlist');

    await PlaylistTrackRepository.add(id, data);
    return this.getPlaylistDetails(id, userId);
  }

  static async removeTrack(
    id: string,
    userId: string,
    spotifyTrackId: string
  ): Promise<PlaylistDetails> {
    const playlist = await PlaylistRepository.findById(id);
    if (!playlist) throw new NotFoundError('Playlist');
    if (playlist.userId !== userId) throw new ForbiddenError('Access denied to this playlist');

    const trackExists = await PlaylistTrackRepository.exists(id, spotifyTrackId);
    if (!trackExists) throw new NotFoundError('Track in playlist');

    await PlaylistTrackRepository.remove(id, spotifyTrackId);
    return this.getPlaylistDetails(id, userId);
  }
}
