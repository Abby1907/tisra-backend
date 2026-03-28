import { Router } from 'express';
import { authRouter } from './auth';
import { userRouter } from './user';
import { musicRouter } from './music';
import { roomRouter } from './room';
import { playlistRouter } from './playlist';
import { authMiddleware } from '../middlewares/auth';

const rootRouter: Router = Router();

rootRouter.use('/auth', authRouter);
rootRouter.use('/users', authMiddleware, userRouter);
rootRouter.use('/music', authMiddleware, musicRouter);
rootRouter.use('/rooms', authMiddleware, roomRouter);
rootRouter.use('/playlists', authMiddleware, playlistRouter);

export { rootRouter };
