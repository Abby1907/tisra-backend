import axios from 'axios';
import { SpotifyClient } from '../../config/spotify';
import {
  SpotifySearchResult,
  SpotifyTrack,
  SpotifyFeaturedResponse,
  SpotifyNewReleasesResponse,
} from '../../types/music.types';

export class SpotifyHelper {
  private static readonly BASE_URL = 'https://api.spotify.com/v1';

  private static async getHeaders(): Promise<{ Authorization: string }> {
    const token = await SpotifyClient.getAccessToken();
    return { Authorization: `Bearer ${token}` };
  }

  static async searchTracks(
    query: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<SpotifySearchResult> {
    const headers = await this.getHeaders();
    const response = await axios.get(`${this.BASE_URL}/search`, {
      headers,
      params: {
        q: query,
        type: 'track',
        limit,
        offset,
      },
    });
    return response.data;
  }

  static async getTrack(trackId: string): Promise<SpotifyTrack> {
    const headers = await this.getHeaders();
    const response = await axios.get(`${this.BASE_URL}/tracks/${trackId}`, { headers });
    return response.data;
  }

  static async getFeaturedPlaylists(limit: number = 20): Promise<SpotifyFeaturedResponse> {
    const headers = await this.getHeaders();
    const response = await axios.get(`${this.BASE_URL}/browse/featured-playlists`, {
      headers,
      params: { limit },
    });
    return response.data as SpotifyFeaturedResponse;
  }

  static async getNewReleases(limit: number = 20): Promise<SpotifyNewReleasesResponse> {
    const headers = await this.getHeaders();
    const response = await axios.get(`${this.BASE_URL}/browse/new-releases`, {
      headers,
      params: { limit },
    });
    return response.data as SpotifyNewReleasesResponse;
  }
}
