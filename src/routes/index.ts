import { Router } from 'express';
import { authRouter } from './auth';
import { userRouter } from './user';
import { musicRouter } from './music';

const rootRouter: Router = Router();

rootRouter.use('/auth', authRouter);
rootRouter.use('/users', userRouter);
rootRouter.use('/music', musicRouter);

export { rootRouter };
