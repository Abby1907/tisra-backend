import { Router } from 'express';
import { authRouter } from './auth';
import { userRouter } from './user';

const rootRouter: Router = Router();

rootRouter.use('/auth', authRouter);
rootRouter.use('/users', userRouter);

export { rootRouter };
