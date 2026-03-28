import axios from 'axios';
import { env } from './env';
import { logger } from '../utils/logger';

export class SpotifyClient {
  private static accessToken: string | null = null;
  private static tokenExpiry: number = 0; // Timestamp in ms

  private static async fetchNewToken(): Promise<void> {
    try {
      const authHeader = Buffer.from(
        `${env.spotify.clientId}:${env.spotify.clientSecret}`
      ).toString('base64');

      const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${authHeader}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = response.data.access_token;
      // Set expiry with a 1-minute buffer
      this.tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;

      logger.info('Spotify Access Token refreshed successfully');
    } catch (error) {
      logger.error('Failed to fetch Spotify Access Token', { error });
      throw new Error('Spotify Authentication Failed');
    }
  }

  static async getAccessToken(): Promise<string> {
    if (!this.accessToken || Date.now() >= this.tokenExpiry) {
      await this.fetchNewToken();
    }
    return this.accessToken!;
  }
}
