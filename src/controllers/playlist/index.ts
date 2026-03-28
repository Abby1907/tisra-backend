import { Response, NextFunction } from 'express';
import { PlaylistService } from '../../services/playlist';
import { AuthenticatedRequest } from '../../types/common.types';

export const createPlaylistController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const playlist = await PlaylistService.createPlaylist(req.user!.id, req.body);
    res.status(201).json({ success: true, data: playlist });
  } catch (error) {
    next(error);
  }
};

export const listPlaylistsController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const playlists = await PlaylistService.getPlaylists(req.user!.id);
    res.status(200).json({ success: true, data: playlists });
  } catch (error) {
    next(error);
  }
};

export const getPlaylistController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const playlist = await PlaylistService.getPlaylistDetails(req.params.id, req.user!.id);
    res.status(200).json({ success: true, data: playlist });
  } catch (error) {
    next(error);
  }
};

export const updatePlaylistController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const playlist = await PlaylistService.updatePlaylist(
      req.params.id,
      req.user!.id,
      req.body.name
    );
    res.status(200).json({ success: true, data: playlist });
  } catch (error) {
    next(error);
  }
};

export const deletePlaylistController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await PlaylistService.deletePlaylist(req.params.id, req.user!.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const addTrackController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const playlist = await PlaylistService.addTrack(req.params.id, req.user!.id, req.body);
    res.status(201).json({ success: true, data: playlist });
  } catch (error) {
    next(error);
  }
};

export const removeTrackController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const playlist = await PlaylistService.removeTrack(
      req.params.id,
      req.user!.id,
      req.params.trackId
    );
    res.status(200).json({ success: true, data: playlist });
  } catch (error) {
    next(error);
  }
};
