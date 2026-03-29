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
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(`${this.BASE_URL}/browse/featured-playlists`, {
        headers,
        params: { limit },
      });
      return response.data as SpotifyFeaturedResponse;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        // Fallback: Search for popular playlists
        const headers = await this.getHeaders();
        const searchRes = await axios.get(`${this.BASE_URL}/search`, {
          headers,
          params: {
            q: 'Top Global Hits',
            type: 'playlist',
            limit,
          },
        });

        return {
          message: 'Popular Playlists',
          playlists: {
            items: searchRes.data.playlists.items
              .filter((p: unknown) => p !== null)
              .map((p: unknown) => ({
                id: (p as { id: string }).id,
                name: (p as { name: string }).name,
                images: (p as { images: { url: string }[] }).images,
                description: (p as { description: string }).description,
              })),
          },
        };
      }
      throw error;
    }
  }

  static async getNewReleases(limit: number = 20): Promise<SpotifyNewReleasesResponse> {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(`${this.BASE_URL}/browse/new-releases`, {
        headers,
        params: { limit },
      });
      return response.data as SpotifyNewReleasesResponse;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        // Fallback: Search for new albums
        const headers = await this.getHeaders();
        const searchRes = await axios.get(`${this.BASE_URL}/search`, {
          headers,
          params: {
            q: 'tag:new',
            type: 'album',
            limit,
          },
        });

        return {
          albums: {
            items: searchRes.data.albums.items
              .filter((a: unknown) => a !== null)
              .map((a: unknown) => ({
                id: (a as { id: string }).id,
                name: (a as { name: string }).name,
                images: (a as { images: { url: string }[] }).images,
                artists: (a as { artists: { name: string }[] }).artists,
              })),
          },
        };
      }
      throw error;
    }
  }
}
