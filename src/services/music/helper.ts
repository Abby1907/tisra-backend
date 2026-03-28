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
    } catch (error: any) {
      if (error.response?.status === 404) {
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
              .filter((p: any) => p !== null)
              .map((p: any) => ({
                id: p.id,
                name: p.name,
                images: p.images,
                description: p.description,
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
    } catch (error: any) {
      if (error.response?.status === 404) {
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
              .filter((a: any) => a !== null)
              .map((a: any) => ({
                id: a.id,
                name: a.name,
                images: a.images,
                artists: a.artists,
              })),
          },
        };
      }
      throw error;
    }
  }
}
