import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { env } from '../../config/env';
import { UserRepository } from '../../repositories/user';
import { AuthenticatedRequest } from '../../types/common.types';
import { UnauthorizedError } from '../../errors';
import { logger } from '../../utils/logger';

export class SpotifyController {
  private static readonly SCOPES = [
    'user-read-private',
    'user-read-email',
    'streaming',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-library-read',
    'playlist-read-private',
  ].join(' ');

  static async login(req: AuthenticatedRequest, res: Response): Promise<void> {
    const params = new URLSearchParams({
      client_id: env.spotify.clientId,
      response_type: 'code',
      redirect_uri: env.spotify.callbackUrl,
      scope: SpotifyController.SCOPES,
      state: req.user!.id,
      show_dialog: 'true',
    });

    res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
  }

  static async callback(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { code, error } = req.query;

    if (error) {
      return next(new UnauthorizedError(`Spotify authorization failed: ${error}`));
    }

    if (!code) {
      return next(new UnauthorizedError('No authorization code provided'));
    }

    try {
      // 1. Exchange code for tokens
      const auth = Buffer.from(`${env.spotify.clientId}:${env.spotify.clientSecret}`).toString(
        'base64'
      );
      const tokenResponse = await axios.post(
        'https://accounts.spotify.com/api/token',
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: code as string,
          redirect_uri: env.spotify.callbackUrl,
        }).toString(),
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const { access_token, refresh_token, expires_in } = tokenResponse.data;
      const expiresAt = new Date(Date.now() + expires_in * 1000);

      // 2. Get Spotify user profile to identify the user
      const profileResponse = await axios.get('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const spotifyId = profileResponse.data.id;

      // 3. Since the user must be logged in to our app to link Spotify,
      // we need a way to identify our internal user.
      // Usually, this flow starts from a frontend page where they are already logged in.
      // For this implementation, we'll assume the user ID is passed in the state or
      // we use a temporary session/cookie.
      // HOWEVER, if the user is already authenticated in our backend via JWT,
      // we can use that if the browser sends the cookie.

      // Let's check for a user from the token in cookies (if available)
      // or we can ask the user to provide a way to pass the internal user ID.
      // A common way is using the 'state' parameter.

      // For now, let's assume we have the user from the session if possible.
      // If not, we might need to update the login to include the user ID in 'state'.

      // INSTRUCTION: To simplify, I'll update the login to include the user ID in state.
      // But wait, the login controller doesn't have the user ID yet if it's a simple redirect.
      // Let's assume the user is ALREADY authenticated via authMiddleware for the login route.

      // If we use authMiddleware on /spotify/login, we can pass user.id in state.

      const userId = req.query.state as string;
      if (!userId) {
        return next(new UnauthorizedError('State (userId) missing from Spotify callback'));
      }

      await UserRepository.update(userId, {
        spotifyId,
        spotifyAccessToken: access_token,
        spotifyRefreshToken: refresh_token,
        spotifyTokenExpiresAt: expiresAt,
      });

      logger.info(`Spotify account ${spotifyId} linked to user ${userId}`);

      // Redirect back to frontend
      res.redirect(`${env.corsOrigin}/dashboard?linked=spotify`);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        logger.error('Spotify callback error:', err.response?.data || err.message);
      } else {
        logger.error('Spotify callback error:', err);
      }
      next(err);
    }
  }

  static async getPlaybackToken(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const userId = req.user!.id;

    try {
      const user = await UserRepository.findById(userId);
      if (!user || !user.spotifyRefreshToken) {
        return next(new UnauthorizedError('Spotify account not linked'));
      }

      let accessToken = user.spotifyAccessToken;
      const now = new Date();

      // Check if token is expired (with 1 minute buffer)
      if (
        !user.spotifyTokenExpiresAt ||
        user.spotifyTokenExpiresAt <= new Date(now.getTime() + 60000)
      ) {
        logger.info(`Refreshing Spotify token for user ${userId}`);

        const auth = Buffer.from(`${env.spotify.clientId}:${env.spotify.clientSecret}`).toString(
          'base64'
        );
        const refreshResponse = await axios.post(
          'https://accounts.spotify.com/api/token',
          new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: user.spotifyRefreshToken,
          }).toString(),
          {
            headers: {
              Authorization: `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );

        const { access_token, expires_in, refresh_token: new_refresh_token } = refreshResponse.data;
        accessToken = access_token;
        const expiresAt = new Date(Date.now() + expires_in * 1000);

        await UserRepository.update(userId, {
          spotifyAccessToken: access_token,
          spotifyRefreshToken: new_refresh_token || user.spotifyRefreshToken, // Some APIs might not return a new refresh token
          spotifyTokenExpiresAt: expiresAt,
        });
      }

      res.status(200).json({
        success: true,
        data: {
          accessToken,
        },
      });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        logger.error('Error getting Spotify playback token:', err.response?.data || err.message);
      } else {
        logger.error('Error getting Spotify playback token:', err);
      }
      next(err);
    }
  }
}
