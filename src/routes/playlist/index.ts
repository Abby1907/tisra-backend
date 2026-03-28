import { Router } from 'express';
import {
  createPlaylistController,
  listPlaylistsController,
  getPlaylistController,
  updatePlaylistController,
  deletePlaylistController,
  addTrackController,
  removeTrackController,
} from '../../controllers/playlist';
import {
  createPlaylistValidator,
  updatePlaylistValidator,
  addTrackValidator,
} from '../../validators/playlist';

const playlistRouter: Router = Router();

playlistRouter.post('/', createPlaylistValidator, createPlaylistController);
playlistRouter.get('/', listPlaylistsController);
playlistRouter.get('/:id', getPlaylistController);
playlistRouter.patch('/:id', updatePlaylistValidator, updatePlaylistController);
playlistRouter.delete('/:id', deletePlaylistController);

playlistRouter.post('/:id/tracks', addTrackValidator, addTrackController);
playlistRouter.delete('/:id/tracks/:trackId', removeTrackController);

export { playlistRouter };
