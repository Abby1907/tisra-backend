import { SpotifyHelper } from './helper';
import {
  TrackDetails,
  SearchQueryParams,
  SpotifyFeaturedResponse,
  SpotifyNewReleasesResponse,
  SpotifyTrack,
} from '../../types/music.types';

export class MusicService {
  static async search(params: SearchQueryParams): Promise<TrackDetails[]> {
    const { q, limit, offset } = params;
    const result = await SpotifyHelper.searchTracks(q, limit, offset);

    return result.tracks.items.map((item: SpotifyTrack) => ({
      id: item.id,
      name: item.name,
      artistName: item.artists.map((a: { name: string }) => a.name).join(', '),
      albumName: item.album.name,
      albumArt: item.album.images[0]?.url || null,
      durationMs: item.duration_ms,
      spotifyUrl: `https://open.spotify.com/track/${item.id}`,
    }));
  }

  static async getTrackDetails(trackId: string): Promise<TrackDetails> {
    const track = await SpotifyHelper.getTrack(trackId);

    return {
      id: track.id,
      name: track.name,
      artistName: track.artists.map((a: { name: string }) => a.name).join(', '),
      albumName: track.album.name,
      albumArt: track.album.images[0]?.url || null,
      durationMs: track.duration_ms,
      spotifyUrl: `https://open.spotify.com/track/${track.id}`,
    };
  }

  static async getFeatured(): Promise<SpotifyFeaturedResponse> {
    return SpotifyHelper.getFeaturedPlaylists();
  }

  static async getNewReleases(): Promise<SpotifyNewReleasesResponse> {
    return SpotifyHelper.getNewReleases();
  }
}
