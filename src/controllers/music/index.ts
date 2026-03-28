import { Request, Response, NextFunction } from 'express';
import { MusicService } from '../../services/music';
import { ApiResponse } from '../../types/common.types';
import { SearchQueryParams } from '../../types/music.types';

export class MusicController {
  static async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await MusicService.search(req.query as unknown as SearchQueryParams);
      res.status(200).json({
        success: true,
        message: 'Search results retrieved',
        data: result,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  static async getTrackDetails(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await MusicService.getTrackDetails(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Track details retrieved',
        data: result,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  static async getFeatured(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await MusicService.getFeatured();
      res.status(200).json({
        success: true,
        message: 'Featured playlists retrieved',
        data: result,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  static async getNewReleases(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await MusicService.getNewReleases();
      res.status(200).json({
        success: true,
        message: 'New releases retrieved',
        data: result,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }
}
